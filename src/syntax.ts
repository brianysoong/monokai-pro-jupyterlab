/**
 * Editor plumbing that lets the theme CSS reproduce Monokai Pro's token
 * colors faithfully.
 *
 * JupyterLab's built-in highlighter gives every keyword the same class, so
 * `def` and `if` cannot be told apart. This module adds:
 *
 * - a tag highlighter that emits stable `mpce-tok-*` classes for finer
 *   grammar tags, and
 * - a Python-only view plugin that emits `mpce-sem-*` classes for things no
 *   grammar tag covers (parameters, self/cls, keyword arguments, docstrings,
 *   decorators, base classes and builtin types).
 *
 * Neither carries any color. The classes are only styled by this theme's
 * stylesheet, so they have no effect while another theme is active.
 *
 * Code blocks in rendered Markdown are highlighted outside any editor, so
 * `extendStaticHighlighting` adds the same token classes there.
 */

import { language, syntaxHighlighting, syntaxTree } from '@codemirror/language';
import { Extension, Prec, RangeSetBuilder } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view';
import {
  IEditorLanguageRegistry,
  jupyterHighlightStyle
} from '@jupyterlab/codemirror';
import { SyntaxNode, Tree } from '@lezer/common';
import { highlightTree, tagHighlighter, tags as t } from '@lezer/highlight';

/**
 * Grammar tag -> class. More specific tags take precedence over their
 * parents, e.g. `definitionKeyword` over `keyword`.
 */
const tokenHighlighter = tagHighlighter([
  { tag: t.comment, class: 'mpce-tok-comment' },

  { tag: t.keyword, class: 'mpce-tok-keyword' },
  { tag: t.definitionKeyword, class: 'mpce-tok-storage' },
  { tag: t.modifier, class: 'mpce-tok-modifier' },
  { tag: t.operator, class: 'mpce-tok-operator' },
  { tag: t.unit, class: 'mpce-tok-keyword' },

  { tag: t.string, class: 'mpce-tok-string' },
  { tag: t.regexp, class: 'mpce-tok-string' },
  { tag: t.attributeValue, class: 'mpce-tok-string' },

  { tag: [t.number, t.bool, t.null, t.atom], class: 'mpce-tok-constant' },
  { tag: [t.escape, t.color, t.labelName], class: 'mpce-tok-constant' },
  { tag: t.constant(t.name), class: 'mpce-tok-constant' },

  { tag: t.variableName, class: 'mpce-tok-variable' },
  { tag: t.propertyName, class: 'mpce-tok-variable' },
  { tag: t.self, class: 'mpce-tok-self' },
  {
    tag: [
      t.function(t.variableName),
      t.function(t.propertyName),
      t.function(t.definition(t.variableName)),
      t.standard(t.variableName)
    ],
    class: 'mpce-tok-function'
  },
  { tag: [t.className, t.namespace], class: 'mpce-tok-class' },
  { tag: t.typeName, class: 'mpce-tok-type' },

  // Includes `.` member access, which Lezer tags as an operator
  { tag: [t.punctuation, t.derefOperator], class: 'mpce-tok-punctuation' },
  { tag: t.meta, class: 'mpce-tok-meta' },
  { tag: t.tagName, class: 'mpce-tok-tag' },
  { tag: t.attributeName, class: 'mpce-tok-attribute' },
  { tag: t.invalid, class: 'mpce-tok-invalid' },

  { tag: t.inserted, class: 'mpce-tok-inserted' },
  { tag: t.deleted, class: 'mpce-tok-deleted' },
  { tag: t.changed, class: 'mpce-tok-changed' },

  // Markdown
  { tag: t.heading, class: 'mpce-tok-heading' },
  { tag: t.link, class: 'mpce-tok-link' },
  { tag: t.url, class: 'mpce-tok-url' },
  { tag: t.monospace, class: 'mpce-tok-raw' },
  { tag: t.quote, class: 'mpce-tok-quote' },
  {
    tag: [t.processingInstruction, t.contentSeparator],
    class: 'mpce-tok-markup'
  }
]);

/**
 * Builtins that Monokai Pro colors as types (`support.type.python`) rather
 * than functions.
 */
const BUILTIN_TYPES = new Set([
  'bool',
  'bytearray',
  'bytes',
  'classmethod',
  'complex',
  'dict',
  'float',
  'frozenset',
  'int',
  'list',
  'memoryview',
  'object',
  'property',
  'set',
  'slice',
  'staticmethod',
  'str',
  'super',
  'tuple',
  'type'
]);

const BUILTIN_EXCEPTION =
  /^(?:Base)?Exception$|^[A-Z]\w*(?:Error|Warning)$|^(?:SystemExit|KeyboardInterrupt|GeneratorExit|Stop(?:Async)?Iteration)$/;

const DOCSTRING = /^[rRuU]?("""|''')/;

/** Keywords that Lezer tags as definitions but Monokai Pro colors as control. */
const PLAIN_KEYWORDS = new Set(['from', 'global', 'nonlocal']);

type Semantic =
  | 'param'
  | 'self'
  | 'keyword'
  | 'docstring'
  | 'decorator'
  | 'inherited'
  | 'type';

function isBaseClassList(node: SyntaxNode | null): boolean {
  return node?.name === 'ArgList' && node.parent?.name === 'ClassDefinition';
}

/**
 * Walk a Python syntax tree and report the ranges that need a semantic
 * class (`mpce-sem-<kind>`), in document order.
 */
function walkPythonSemantics(
  tree: Tree,
  slice: (from: number, to: number) => string,
  emit: (from: number, to: number, kind: Semantic) => void,
  range?: { from: number; to: number }
): void {
  tree.iterate({
    ...range,
    enter: ref => {
      const name = ref.name;

      if (PLAIN_KEYWORDS.has(name)) {
        emit(ref.from, ref.to, 'keyword');
        return;
      }

      if (name === 'Decorator') {
        // Color `@name.attr`, leaving any call arguments to the rules below.
        const args = ref.node.getChild('ArgList');
        emit(ref.from, args ? args.from : ref.to, 'decorator');
        return;
      }

      if (name === 'ExpressionStatement') {
        const child = ref.node.firstChild;
        if (
          child &&
          child.name === 'String' &&
          !child.nextSibling &&
          DOCSTRING.test(slice(child.from, child.from + 4))
        ) {
          emit(child.from, child.to, 'docstring');
          return false;
        }
        return;
      }

      if (name === 'MemberExpression' && isBaseClassList(ref.node.parent)) {
        emit(ref.from, ref.to, 'inherited');
        return false;
      }

      if (name !== 'VariableName') {
        return;
      }

      const node = ref.node;
      const parent = node.parent;
      if (!parent || parent.name === 'Decorator') {
        return;
      }
      const text = slice(ref.from, ref.to);
      const isSelf = text === 'self' || text === 'cls';

      if (parent.name === 'ParamList') {
        emit(ref.from, ref.to, isSelf ? 'self' : 'param');
      } else if (isSelf) {
        emit(ref.from, ref.to, 'self');
      } else if (
        parent.name === 'ArgList' &&
        node.nextSibling?.name === 'AssignOp'
      ) {
        // Keyword argument in a call: f(x=1)
        emit(ref.from, ref.to, 'param');
      } else if (isBaseClassList(parent)) {
        emit(ref.from, ref.to, 'inherited');
      } else if (BUILTIN_TYPES.has(text) || BUILTIN_EXCEPTION.test(text)) {
        emit(ref.from, ref.to, 'type');
      }
    }
  });
}

const marks: Record<Semantic, Decoration> = {
  param: Decoration.mark({ class: 'mpce-sem-param' }),
  self: Decoration.mark({ class: 'mpce-sem-self' }),
  keyword: Decoration.mark({ class: 'mpce-sem-keyword' }),
  docstring: Decoration.mark({ class: 'mpce-sem-docstring' }),
  decorator: Decoration.mark({ class: 'mpce-sem-decorator' }),
  inherited: Decoration.mark({ class: 'mpce-sem-inherited' }),
  type: Decoration.mark({ class: 'mpce-sem-type' })
};

function pythonDecorations(view: EditorView): DecorationSet {
  if (view.state.facet(language)?.name !== 'python') {
    return Decoration.none;
  }
  const doc = view.state.doc;
  const builder = new RangeSetBuilder<Decoration>();
  walkPythonSemantics(
    syntaxTree(view.state),
    (from, to) => doc.sliceString(from, to),
    (from, to, kind) => builder.add(from, to, marks[kind]),
    view.viewport
  );
  return builder.finish();
}

const pythonSemantics = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    private tree: Tree;

    constructor(view: EditorView) {
      this.tree = syntaxTree(view.state);
      this.decorations = pythonDecorations(view);
    }

    update(update: ViewUpdate) {
      const tree = syntaxTree(update.state);
      if (
        update.docChanged ||
        update.viewportChanged ||
        tree !== this.tree ||
        update.startState.facet(language) !== update.state.facet(language)
      ) {
        this.tree = tree;
        this.decorations = pythonDecorations(update.view);
      }
    }
  },
  { decorations: v => v.decorations }
);

/**
 * The editor extension registered by this package.
 *
 * The semantic marks get the highest precedence so they render as the
 * innermost spans, inside the highlighter's token spans.
 */
export function monokaiSyntax(): Extension {
  return [syntaxHighlighting(tokenHighlighter), Prec.highest(pythonSemantics)];
}

/**
 * Make code blocks in rendered Markdown carry the same token classes as the
 * editor, so `def` looks the same in a Markdown cell's output as in a code
 * cell.
 *
 * JupyterLab highlights these blocks with a fixed highlighter, so this wraps
 * `IEditorLanguageRegistry.highlight` to add this module's highlighter
 * alongside it. Any failure falls back to JupyterLab's own implementation.
 */
export function extendStaticHighlighting(
  languages: IEditorLanguageRegistry
): void {
  const original = languages.highlight.bind(languages);

  languages.highlight = async (code, editorLanguage, el) => {
    try {
      const resolved = editorLanguage
        ? await languages.getLanguage(editorLanguage)
        : null;
      const parser = resolved?.support?.language.parser;
      if (!parser) {
        return original(code, editorLanguage, el);
      }

      const tree = parser.parse(code);

      // Python semantics, as [from, to, class] in document order. Every
      // range covers whole highlighted tokens, so each token span can just
      // pick up the classes of the ranges containing it.
      const semantics: [number, number, string][] = [];
      if (resolved?.support?.language.name === 'python') {
        walkPythonSemantics(
          tree,
          (from, to) => code.slice(from, to),
          (from, to, kind) => semantics.push([from, to, `mpce-sem-${kind}`])
        );
      }
      let next = 0;

      const fragment = document.createDocumentFragment();
      let pos = 0;
      highlightTree(
        tree,
        [jupyterHighlightStyle, tokenHighlighter],
        (from, to, classes) => {
          if (from > pos) {
            fragment.append(code.slice(pos, from));
          }
          while (next < semantics.length && semantics[next][1] <= from) {
            next++;
          }
          for (let i = next; i < semantics.length; i++) {
            const [start, end, cls] = semantics[i];
            if (start > from) {
              break;
            }
            if (end >= to) {
              classes += ` ${cls}`;
            }
          }
          const span = document.createElement('span');
          span.className = classes;
          span.textContent = code.slice(from, to);
          fragment.append(span);
          pos = to;
        }
      );
      fragment.append(code.slice(pos));
      el.appendChild(fragment);
    } catch (reason) {
      console.warn(
        'Monokai Pro (CE): falling back to default highlighting.',
        reason
      );
      return original(code, editorLanguage, el);
    }
  };
}
