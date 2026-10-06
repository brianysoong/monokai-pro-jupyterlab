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
  | 'type'
  | 'punct'
  | 'regexQuote'
  | 'prefix';

/** String prefix and opening quotes, e.g. `rb'` or `f"""`. */
const STRING_OPEN = /^([a-zA-Z]*)("""|'''|"|')/;

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
        // `@` is punctuation; color `name.attr`, leaving any call arguments
        // to the rules below
        const at = ref.node.getChild('At');
        const args = ref.node.getChild('ArgList');
        if (at) {
          emit(at.from, at.to, 'punct');
        }
        emit(at ? at.to : ref.from, args ? args.from : ref.to, 'decorator');
        return;
      }

      // Colons, and the `->` of return annotations (not a node of its own)
      if (name === ':') {
        emit(ref.from, ref.to, 'punct');
        return;
      }
      if (
        name === 'TypeDef' &&
        ref.node.parent?.name === 'FunctionDefinition' &&
        slice(ref.from, ref.from + 2) === '->'
      ) {
        emit(ref.from, ref.from + 2, 'punct');
        return;
      }

      // String prefixes (r, b, f, ...) and quotes; the contents keep the
      // string color. As in VS Code's grammar, f-string quotes keep the
      // string color and raw strings are regular expressions, whose quotes
      // are red.
      if (name === 'String' || name === 'FormatString') {
        const text = slice(ref.from, ref.to);
        const open = STRING_OPEN.exec(text);
        if (open) {
          const [, prefix, quote] = open;
          if (prefix) {
            emit(ref.from, ref.from + prefix.length, 'prefix');
          }
          const quotes: Semantic | null = /f/i.test(prefix)
            ? null
            : /r/i.test(prefix)
              ? 'regexQuote'
              : 'punct';
          const start = ref.from + prefix.length;
          if (quotes) {
            emit(start, start + quote.length, quotes);
            if (
              text.length >= prefix.length + quote.length * 2 &&
              text.endsWith(quote)
            ) {
              emit(ref.to - quote.length, ref.to, quotes);
            }
          }
        }
        return;
      }

      // f-string conversions (!r, !s) are storage types
      if (name === 'FormatConversion') {
        emit(ref.from, ref.to, 'prefix');
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

const OPENING = new Set(['(', '[', '{']);
const CLOSING = new Set([')', ']', '}']);

/**
 * Rainbow brackets, as VS Code colors them by default: each bracket gets
 * `mpce-bracket-<depth mod 6>`.
 *
 * One pass in document order with a depth counter. Brackets inside strings
 * and comments aren't syntax nodes, so they're skipped naturally, while
 * f-string placeholders are, matching VS Code. With a range (the viewport),
 * whole subtrees before it are skipped: their brackets are balanced, so only
 * the enclosing nodes' brackets affect the depth. Returns the depth reached.
 */
function walkBrackets(
  tree: Tree,
  emit: (from: number, to: number, cls: string) => void,
  range?: { from: number; to: number }
): number {
  let depth = 0;
  tree.iterate({
    to: range?.to,
    enter: ref => {
      const opening = OPENING.has(ref.name);
      if (opening || CLOSING.has(ref.name)) {
        if (!opening) {
          depth = Math.max(0, depth - 1);
        }
        if (!range || ref.from >= range.from) {
          emit(ref.from, ref.to, `mpce-bracket-${depth % 6}`);
        }
        if (opening) {
          depth++;
        }
        return;
      }
      if (range && ref.to <= range.from) {
        return false;
      }
    }
  });
  return depth;
}

/** The bracket depth after the brackets that start at or before `pos`. */
function bracketDepth(tree: Tree, pos: number): number {
  return walkBrackets(tree, () => undefined, { from: pos, to: pos });
}

/**
 * Every class range this module adds to a syntax tree, sorted by position:
 * rainbow brackets for any language, plus Python semantics.
 */
function classRanges(
  tree: Tree,
  isPython: boolean,
  slice: (from: number, to: number) => string,
  range?: { from: number; to: number }
): [number, number, string][] {
  const ranges: [number, number, string][] = [];
  if (isPython) {
    walkPythonSemantics(
      tree,
      slice,
      (from, to, kind) => ranges.push([from, to, `mpce-sem-${kind}`]),
      range
    );
  }
  walkBrackets(tree, (from, to, cls) => ranges.push([from, to, cls]), range);
  // e.g. a string's closing quote is reported before what it contains
  return ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

const markCache = new Map<string, Decoration>();
function mark(cls: string): Decoration {
  let deco = markCache.get(cls);
  if (!deco) {
    deco = Decoration.mark({ class: cls });
    markCache.set(cls, deco);
  }
  return deco;
}

type Range = { from: number; to: number };

/** Statements, including compound statements and definitions. */
const STATEMENT = /Statement$|Definition$/;

/**
 * Edits containing these can change how far a string, comment or statement
 * extends, so they always redecorate the whole viewport.
 */
const STRUCTURAL = /['"#\\\n]/;

/** The innermost statement around `from`-`to`, or the whole document. */
function statementAround(tree: Tree, from: number, to: number): Range {
  for (
    let node: SyntaxNode | null = tree.resolveInner(from, from < to ? 1 : -1);
    node;
    node = node.parent
  ) {
    if (node.to >= to && STATEMENT.test(node.name)) {
      return node;
    }
  }
  return { from: 0, to: tree.length };
}

const overlaps = (from: number, to: number, range: Range) =>
  from < range.to && to > range.from;

/**
 * The parts of the new document to redecorate after an ordinary edit, sorted
 * and disjoint, or null if the edit may affect more than its statement.
 */
function changedRegions(
  update: ViewUpdate,
  oldTree: Tree,
  tree: Tree
): Range[] | null {
  const { changes, startState, state } = update;
  if (tree.length < state.doc.length) {
    // Still parsing; the tree will update again
    return null;
  }
  const regions: Range[] = [];
  let simple = true;
  changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
    if (!simple) {
      return;
    }
    const line = state.doc.lineAt(fromB);
    if (
      STRUCTURAL.test(inserted.toString()) ||
      STRUCTURAL.test(startState.doc.sliceString(fromA, toA)) ||
      // Indentation decides which block a line belongs to
      !state.doc.sliceString(line.from, fromB).trim()
    ) {
      simple = false;
      return;
    }
    const before = statementAround(oldTree, fromA, toA);
    const after = statementAround(tree, fromB, toB);
    const region = {
      from: Math.min(changes.mapPos(before.from, -1), after.from),
      to: Math.max(changes.mapPos(before.to, 1), after.to)
    };
    // Brackets after the statement keep their colors only if it nests
    // them as deeply as before
    if (
      bracketDepth(oldTree, changes.invertedDesc.mapPos(region.to, 1)) !==
      bracketDepth(tree, region.to)
    ) {
      simple = false;
      return;
    }
    regions.push(region);
  });
  if (!simple) {
    return null;
  }
  regions.sort((a, b) => a.from - b.from);
  const merged: Range[] = [];
  for (const region of regions) {
    const last = merged[merged.length - 1];
    if (last && region.from <= last.to) {
      last.to = Math.max(last.to, region.to);
    } else {
      merged.push({ ...region });
    }
  }
  return merged;
}

/**
 * Maintains the semantic and bracket marks for the viewport.
 *
 * Rebuilding them is cheap but runs on every keystroke, so ordinary typing
 * only rebuilds the statement being edited: the statement around each change
 * in the old and new syntax trees, which covers any restructuring the edit
 * caused. Edits that may reach past that statement (quotes, comments, line
 * breaks, indentation, or a change in bracket depth) rebuild the viewport.
 */
const semantics = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet = Decoration.none;
    private tree: Tree;
    /** The document range the decorations are up to date for. */
    private covered: Range = { from: 0, to: 0 };

    constructor(view: EditorView) {
      this.tree = syntaxTree(view.state);
      this.rebuild(view);
    }

    update(update: ViewUpdate) {
      const oldTree = this.tree;
      const tree = (this.tree = syntaxTree(update.state));
      const { viewport } = update.view;

      if (update.startState.facet(language) !== update.state.facet(language)) {
        this.rebuild(update.view);
      } else if (update.docChanged) {
        // Text inserted at either end is covered by its changed region
        const covered = {
          from: update.changes.mapPos(this.covered.from, -1),
          to: update.changes.mapPos(this.covered.to, 1)
        };
        const regions =
          viewport.from >= covered.from && viewport.to <= covered.to
            ? changedRegions(update, oldTree, tree)
            : null;
        if (regions) {
          this.decorations = this.decorations.map(update.changes);
          this.covered = covered;
          for (const region of regions) {
            this.redecorate(update.view, region);
          }
        } else {
          this.rebuild(update.view);
        }
      } else if (
        tree !== oldTree ||
        viewport.from < this.covered.from ||
        viewport.to > this.covered.to
      ) {
        this.rebuild(update.view);
      }
    }

    /** Decorate the viewport from scratch. */
    private rebuild(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      for (const [from, to, cls] of this.classRanges(view, view.viewport)) {
        builder.add(from, to, mark(cls));
      }
      this.decorations = builder.finish();
      this.covered = view.viewport;
    }

    /** Replace the decorations in part of the covered range. */
    private redecorate(view: EditorView, range: Range) {
      const region = {
        from: Math.max(range.from, this.covered.from),
        to: Math.min(range.to, this.covered.to)
      };
      if (region.from >= region.to) {
        return;
      }
      this.decorations = this.decorations.update({
        filterFrom: region.from,
        filterTo: region.to,
        filter: (from, to) => !overlaps(from, to, region),
        add: this.classRanges(view, region)
          .filter(([from, to]) => overlaps(from, to, region))
          .map(([from, to, cls]) => mark(cls).range(from, to))
      });
    }

    private classRanges(view: EditorView, range: Range) {
      const doc = view.state.doc;
      return classRanges(
        this.tree,
        view.state.facet(language)?.name === 'python',
        (from, to) => doc.sliceString(from, to),
        range
      );
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
  return [syntaxHighlighting(tokenHighlighter), Prec.highest(semantics)];
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
      const isPython = resolved?.support?.language.name === 'python';

      // Highlighter classes per token, plus this module's class ranges,
      // which may cover part of a token (a string's quotes) or text the
      // highlighter leaves unstyled (a colon). Split the code at every
      // boundary and give each piece the classes covering it.
      const spans: [number, number, string][] = [];
      highlightTree(
        tree,
        [jupyterHighlightStyle, tokenHighlighter],
        (from, to, classes) => spans.push([from, to, classes])
      );
      const ranges = [
        ...spans,
        ...classRanges(tree, isPython, (from, to) => code.slice(from, to))
      ];
      // Sweep the boundaries once, tracking which ranges cover each piece
      const cuts = new Set([0, code.length]);
      for (const [from, to] of ranges) {
        cuts.add(from);
        cuts.add(to);
      }
      const points = [...cuts].sort((a, b) => a - b);
      ranges.sort((a, b) => a[0] - b[0]);

      const fragment = document.createDocumentFragment();
      let active: [number, number, string][] = [];
      let next = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];
        while (next < ranges.length && ranges[next][0] <= from) {
          active.push(ranges[next++]);
        }
        active = active.filter(([, end]) => end > from);
        const classes = active
          .filter(([, end]) => end >= to)
          .map(([, , cls]) => cls)
          .join(' ');
        const text = code.slice(from, to);
        if (classes) {
          const span = document.createElement('span');
          span.className = classes;
          span.textContent = text;
          fragment.append(span);
        } else {
          fragment.append(text);
        }
      }
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
