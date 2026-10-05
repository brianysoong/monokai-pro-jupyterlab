"use strict";(self.rspackChunkjupyterlab_monokai_pro_ce=self.rspackChunkjupyterlab_monokai_pro_ce||[]).push([[689],{758(r,a,o){var e=o(601),t=o.n(e),d=o(314),m=o.n(d),n=o(417),p=o.n(n),i=new URL(o(411),o.b),l=m()(t()),c=p()(i);l.push([r.id,`/* -----------------------------------------------------------------------------
| Modern UI: the layout language of VS Code's modern workbench.
|
| Enabled by the \`modernUI\` setting, which sets \`data-mpce-modern\` on <html>.
| Unlike the color themes, this stylesheet is always loaded, and it only uses
| JupyterLab's --jp-* variables, so it works on any theme. Monokai Pro
| supplies a few --mpce-* refinements (window, activity bar and card-border
| colors); every one of them has a generic fallback.
|
| Measurements follow VS Code 1.140's modern UI: cards with a 4px gutter, an
| 8px card radius, 4px item radius, and a 1px soft card border.
|---------------------------------------------------------------------------- */

:root[data-mpce-modern] {
  --mm-gap: 4px;
  --mm-radius-xs: 2px;
  --mm-radius-sm: 4px;
  --mm-radius-md: 6px;
  --mm-radius-lg: 8px;

  /* Surfaces */
  --mm-window: var(
    --mpce-dark1,
    color-mix(
      in srgb,
      var(--jp-layout-color0) 94%,
      var(--jp-inverse-layout-color0)
    )
  );
  --mm-activity: var(--mpce-dark2, var(--mm-window));
  --mm-sidebar: var(--mpce-dark1, var(--jp-layout-color1));
  --mm-editor: var(--jp-layout-color0);
  --mm-tab-strip: var(--mm-window);
  --mm-card-border: var(
    --mpce-card-border,
    color-mix(in srgb, var(--jp-border-color1) 70%, transparent)
  );

  /* Interaction washes */
  --mm-hover: color-mix(in srgb, var(--jp-ui-font-color0) 6%, transparent);
  --mm-selected: color-mix(in srgb, var(--jp-ui-font-color0) 9%, transparent);
  --mm-active-fg: var(--mpce-highlight, var(--jp-ui-font-color0));

  /* Elevation */
  --mm-shadow-sm: 0 0 4px rgba(0, 0, 0, 0.24);
  --mm-shadow-md: 0 0 6px rgba(0, 0, 0, 0.3);
  --mm-shadow-lg: 0 2px 8px rgba(0, 0, 0, 0.36);
  --mm-shadow-xl: 0 0 20px rgba(0, 0, 0, 0.4);

  /* Notebook gutter run button */
  --mm-run-icon: url(${c});

  /* Taller tabs and rounder controls, as in VS Code */
  --jp-private-horizontal-tab-height: 30px;
  --jp-border-radius: var(--mm-radius-sm);
}

/* ---- Window and gutters --------------------------------------------------
   Lumino's layouts subtract container padding, so padding the containers
   opens real gutters between the cards. */

:root[data-mpce-modern] body,
:root[data-mpce-modern] .jp-LabShell,
:root[data-mpce-modern] #jp-top-panel,
:root[data-mpce-modern] #jp-menu-panel,
:root[data-mpce-modern] #jp-top-bar,
:root[data-mpce-modern] .lm-MenuBar {
  background: var(--mm-window);
}

:root[data-mpce-modern] #jp-top-panel {
  border-bottom: none;
}

:root[data-mpce-modern] #jp-main-content-panel {
  padding: 0 var(--mm-gap) var(--mm-gap);
  background: var(--mm-window);
}

:root[data-mpce-modern] #jp-main-dock-panel {
  /* Lumino's DockLayout swaps top and left padding, so the dock gets none;
     the gutters live on the side stacks and the split panel instead */
  padding: 0;
}

/* With a side panel collapsed, keep a gutter between the activity bar and
   the editor */
:root[data-mpce-modern]
  #jp-main-content-panel:has(#jp-left-stack.lm-mod-hidden)
  #jp-main-vsplit-panel {
  padding-left: var(--mm-gap);
}

:root[data-mpce-modern]
  #jp-main-content-panel:has(#jp-right-stack.lm-mod-hidden)
  #jp-main-vsplit-panel {
  padding-right: var(--mm-gap);
}

:root[data-mpce-modern] .lm-SplitPanel-handle,
:root[data-mpce-modern] .lm-DockPanel-handle {
  background: transparent;
}

/* ---- Side cards ----------------------------------------------------------
   The activity bar and its open panel form one card, as in VS Code: the
   activity bar is the card's darker leading edge. */

:root[data-mpce-modern] .jp-SideBar.lm-TabBar {
  background: var(--mm-activity);
  border: var(--jp-border-width) solid var(--mm-card-border);
}

:root[data-mpce-modern] .jp-SideBar.lm-TabBar::after {
  display: none;
}

:root[data-mpce-modern] .jp-SideBar.jp-mod-left {
  border-right: none;
  border-radius: var(--mm-radius-lg) 0 0 var(--mm-radius-lg);
}

:root[data-mpce-modern] .jp-SideBar.jp-mod-right {
  border-left: none;
  border-radius: 0 var(--mm-radius-lg) var(--mm-radius-lg) 0;
}

:root[data-mpce-modern] #jp-left-stack,
:root[data-mpce-modern] #jp-right-stack {
  background: transparent;
  border: none;
}

/* The stack's padding is the gutter; its visible child is the card */
:root[data-mpce-modern] #jp-left-stack {
  /* the split handle adds a pixel to the gutter */
  padding-right: calc(var(--mm-gap) - var(--jp-border-width));
}

:root[data-mpce-modern] #jp-right-stack {
  padding-left: calc(var(--mm-gap) - var(--jp-border-width));
}

:root[data-mpce-modern] #jp-left-stack > .lm-Widget,
:root[data-mpce-modern] #jp-right-stack > .lm-Widget {
  border: var(--jp-border-width) solid var(--mm-card-border);
}

:root[data-mpce-modern] #jp-left-stack > .lm-Widget {
  border-left: none;
  border-radius: 0 var(--mm-radius-lg) var(--mm-radius-lg) 0;
}

:root[data-mpce-modern] #jp-right-stack > .lm-Widget {
  border-right: none;
  border-radius: var(--mm-radius-lg) 0 0 var(--mm-radius-lg);
}

/* A collapsed side panel leaves the activity bar as a card of its own */
:root[data-mpce-modern]
  #jp-main-content-panel:has(#jp-left-stack.lm-mod-hidden)
  .jp-SideBar.jp-mod-left,
:root[data-mpce-modern]
  #jp-main-content-panel:has(#jp-right-stack.lm-mod-hidden)
  .jp-SideBar.jp-mod-right {
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-radius: var(--mm-radius-lg);
}

:root[data-mpce-modern] #jp-left-stack > .lm-Widget,
:root[data-mpce-modern] #jp-right-stack > .lm-Widget,
:root[data-mpce-modern] .jp-SidePanel,
:root[data-mpce-modern] .jp-SidePanel .jp-Toolbar {
  background: var(--mm-sidebar);
}

:root[data-mpce-modern] .jp-SidePanel-header,
:root[data-mpce-modern] .jp-SidePanel .jp-Toolbar {
  border-bottom: none;
}

/* Activity bar items: a rounded wash behind the current icon, no edge bar */
:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tab,
:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tab:not(.lm-mod-current),
:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tab:hover:not(.lm-mod-current),
:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tab.lm-mod-current {
  background: transparent;
  border: none;
  box-shadow: none;
}

:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tab.lm-mod-current::after {
  display: none;
}

:root[data-mpce-modern] .jp-SideBar .lm-TabBar-tabIcon {
  border-radius: var(--mm-radius-sm);
  padding: 4px;
}

:root[data-mpce-modern]
  .jp-SideBar
  .lm-TabBar-tab.lm-mod-current
  .lm-TabBar-tabIcon {
  background: var(--mm-selected);
}

/* ---- Editor cards --------------------------------------------------------
   Each dock area is a card: its tab strip on top, the document below. */

:root[data-mpce-modern] .lm-DockPanel-tabBar {
  background: var(--mm-tab-strip);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-bottom: none;
  border-radius: var(--mm-radius-lg) var(--mm-radius-lg) 0 0;
  overflow: hidden;
}

:root[data-mpce-modern] .lm-DockPanel-widget {
  background: var(--mm-editor);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-top: none;
  border-radius: 0 0 var(--mm-radius-lg) var(--mm-radius-lg);
}

/* Tabs: no outlines; the current tab is a raised shape that joins the
   document below it */
:root[data-mpce-modern] #jp-down-stack > .lm-TabBar .lm-TabBar-content,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-content {
  padding: 0 var(--mm-gap);
  align-items: flex-end;
}

:root[data-mpce-modern] #jp-down-stack > .lm-TabBar .lm-TabBar-tab,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab {
  /* size to the title, as VS Code does */
  flex: 0 1 auto;
  max-width: 240px;
  padding: 0 6px 0 10px;
}

:root[data-mpce-modern] #jp-down-stack > .lm-TabBar .lm-TabBar-tab,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-addButton {
  background: transparent;
  border: none;
  margin: 0;
  border-radius: var(--mm-radius-md) var(--mm-radius-md) 0 0;
  color: var(--jp-ui-font-color2);
}

:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab::before,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab::after,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-addButton::after {
  display: none;
}

:root[data-mpce-modern]
  #jp-down-stack
  > .lm-TabBar
  .lm-TabBar-tab:hover:not(.lm-mod-current),
:root[data-mpce-modern]
  .lm-DockPanel-tabBar
  .lm-TabBar-tab:hover:not(.lm-mod-current) {
  background: var(--mm-hover);
  color: var(--jp-ui-font-color0);
}

:root[data-mpce-modern]
  #jp-down-stack
  > .lm-TabBar
  .lm-TabBar-tab.lm-mod-current,
:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab.lm-mod-current {
  background: var(--mm-editor);
  color: var(--jp-ui-font-color1);
}

:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-tab.jp-mod-current {
  color: var(--mm-active-fg);
}

:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-addButton {
  border-radius: var(--mm-radius-sm);
  margin: 0 0 3px 2px;
}

:root[data-mpce-modern] .lm-DockPanel-tabBar .lm-TabBar-addButton:hover {
  background: var(--mm-hover);
}

/* Document toolbars sit inside the card, flat */
:root[data-mpce-modern] .jp-MainAreaWidget > .jp-Toolbar {
  background: var(--mm-editor);
  border-bottom: none;
  box-shadow: none;
}

/* ---- Bottom panel --------------------------------------------------------
   The down area (terminals, logs) is a card like the editor. */

:root[data-mpce-modern] #jp-down-stack {
  padding-top: var(--mm-gap);
  border: none;
  background: var(--mm-window);
}

:root[data-mpce-modern] #jp-down-stack > .lm-TabBar {
  background: var(--mm-tab-strip);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-bottom: none;
  border-radius: var(--mm-radius-lg) var(--mm-radius-lg) 0 0;
}

:root[data-mpce-modern] #jp-down-stack > .lm-TabPanel-stackedPanel {
  background: var(--mm-editor);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-top: none;
  border-radius: 0 0 var(--mm-radius-lg) var(--mm-radius-lg);
}

/* ---- Status bar: flat on the window ------------------------------------- */

:root[data-mpce-modern] .jp-StatusBar-Widget {
  background: var(--mm-window);
  border-top: none;
}

/* ---- Lists ---------------------------------------------------------------
   Rows are inset and rounded, so selection reads as a pill. */

:root[data-mpce-modern] .jp-DirListing-content {
  padding: 2px var(--mm-gap);
}

:root[data-mpce-modern] .jp-DirListing-item {
  border-radius: var(--mm-radius-sm);
}

:root[data-mpce-modern] .jp-DirListing-header {
  border-top: none;
  border-bottom: none;
  background: transparent;
}

/* ---- Floating surfaces ---------------------------------------------------
   Menus, the command palette, dialogs and editor widgets float as rounded
   panels with soft shadows; their rows are inset pills. */

:root[data-mpce-modern] .lm-Menu {
  padding: var(--mm-gap);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-radius: var(--mm-radius-lg);
  box-shadow: var(--mm-shadow-lg);
}

:root[data-mpce-modern] .lm-Menu-item {
  border-radius: var(--mm-radius-sm);
}

/* Drop-down menus float just below the menu bar rather than hanging from it */
:root[data-mpce-modern] .lm-MenuBar-menu.jp-ThemedContainer {
  margin-top: var(--mm-gap);
}

:root[data-mpce-modern] .lm-MenuBar-item {
  border: none;
  border-radius: var(--mm-radius-sm);
}

:root[data-mpce-modern]
  .lm-MenuBar.lm-mod-active
  .lm-MenuBar-item.lm-mod-active {
  border: none;
}

:root[data-mpce-modern] .jp-ModalCommandPalette.jp-ThemedContainer {
  padding: var(--mm-gap);
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-radius: var(--mm-radius-lg);
  box-shadow: var(--mm-shadow-xl);
  overflow: hidden;
}

:root[data-mpce-modern] .lm-CommandPalette-wrapper {
  border-radius: var(--mm-radius-md);
}

:root[data-mpce-modern] .lm-CommandPalette-content {
  padding: 0 var(--mm-gap);
}

:root[data-mpce-modern] .lm-CommandPalette-item,
:root[data-mpce-modern] .lm-CommandPalette-header {
  border-radius: var(--mm-radius-sm);
}

:root[data-mpce-modern] .lm-CommandPalette-header {
  border-bottom: none;
}

:root[data-mpce-modern] .jp-Dialog-content {
  border: var(--jp-border-width) solid var(--mm-card-border);
  border-radius: var(--mm-radius-lg);
  box-shadow: var(--mm-shadow-xl);
}

:root[data-mpce-modern] .jp-Completer,
:root[data-mpce-modern] .jp-Tooltip,
:root[data-mpce-modern] .jp-Notebook-cell .jp-Toolbar.jp-cell-toolbar,
:root[data-mpce-modern] .jp-toast {
  border-radius: var(--mm-radius-md);
  box-shadow: var(--mm-shadow-md);
}

:root[data-mpce-modern] .jp-Completer {
  padding: var(--mm-gap);
}

:root[data-mpce-modern] .jp-Completer-item {
  border-radius: var(--mm-radius-sm);
}

/* ---- Controls ------------------------------------------------------------ */

:root[data-mpce-modern] button.jp-mod-styled,
:root[data-mpce-modern] .jp-Dialog-button,
:root[data-mpce-modern] input.jp-mod-styled,
:root[data-mpce-modern] select.jp-mod-styled,
:root[data-mpce-modern] .jp-InputGroup input,
:root[data-mpce-modern] .jp-ToolbarButtonComponent {
  border-radius: var(--mm-radius-sm);
}

/* ---- Notebook cells ------------------------------------------------------
   VS Code notebook cells: rounded editors with a hairline outline that
   brightens while editing, a narrow gutter holding the run button and the
   execution count, a slim pill marking the active cell, and a floating
   cell toolbar. Outputs drop the Out[n] prompt, as VS Code does. */

:root[data-mpce-modern] .jp-Notebook {
  --jp-cell-prompt-width: 52px;
  --mm-cell-radius: var(--mm-radius-md);
  --mm-focus-ring: var(--mpce-dimmed3, var(--jp-border-color0));
}

:root[data-mpce-modern] .jp-Notebook .jp-InputArea-editor {
  border-radius: var(--mm-cell-radius);
  overflow: hidden;
}

/* Gutter: the run button sits above the execution count */
:root[data-mpce-modern] .jp-Notebook .jp-InputPrompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px 0 0;
  text-align: center;
  font-size: 10px;
  opacity: 0.75;
}

:root[data-mpce-modern] .jp-Notebook .jp-CodeCell .jp-InputPrompt::before {
  content: '';
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: var(--mm-radius-sm);
  background-color: var(--jp-ui-font-color1);
  mask: var(--mm-run-icon) center / 16px 16px no-repeat;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s;
}

:root[data-mpce-modern] .jp-Notebook .jp-CodeCell:hover .jp-InputPrompt::before,
:root[data-mpce-modern]
  .jp-Notebook
  .jp-CodeCell.jp-mod-active
  .jp-InputPrompt::before {
  opacity: 1;
}

:root[data-mpce-modern]
  .jp-Notebook
  .jp-CodeCell
  .jp-InputPrompt:hover::before {
  background-color: var(--mm-active-fg);
}

:root[data-mpce-modern] .jp-Notebook .jp-OutputPrompt {
  visibility: hidden;
}

/* Active-cell marker: a slim rounded pill instead of a filled column */
:root[data-mpce-modern] .jp-Notebook .jp-Cell .jp-Collapser,
:root[data-mpce-modern] .jp-Notebook .jp-Cell.jp-mod-active .jp-Collapser,
:root[data-mpce-modern] .jp-Notebook .jp-Cell .jp-Collapser:hover,
:root[data-mpce-modern]
  .jp-Notebook
  .jp-Cell.jp-mod-active
  .jp-Collapser:hover {
  background: transparent;
  box-shadow: none;
  opacity: 1;
}

:root[data-mpce-modern] .jp-Notebook .jp-Collapser-child {
  left: 3px;
  width: 3px;
  border-radius: var(--mm-radius-xs);
}

:root[data-mpce-modern]
  .jp-Notebook
  .jp-Cell
  .jp-Collapser:hover
  .jp-Collapser-child {
  background: var(--jp-border-color0);
}

:root[data-mpce-modern]
  .jp-Notebook
  .jp-Cell.jp-mod-active
  .jp-Collapser
  .jp-Collapser-child {
  background: var(--mm-active-fg);
}

:root[data-mpce-modern]
  .jp-Notebook
  .jp-Cell.jp-mod-active.jp-mod-dirty
  .jp-Collapser
  .jp-Collapser-child {
  background: var(--jp-warn-color1);
}

/* Command-mode focus and multi-selection read as rounded cards */
:root[data-mpce-modern] .jp-Notebook .jp-Cell {
  border-radius: var(--mm-radius-lg);
}

:root[data-mpce-modern]
  .jp-Notebook.jp-mod-commandMode
  .jp-Cell.jp-mod-active:focus-visible {
  border-radius: var(--mm-radius-lg);
  box-shadow: 0 0 0 1px var(--mm-focus-ring);
}

/* Floating cell toolbar */
:root[data-mpce-modern] .jp-Notebook .jp-cell-toolbar {
  padding: 0 2px;
  background: var(--mpce-panel, var(--jp-layout-color1));
  border: var(--jp-border-width) solid var(--mm-card-border);
}

:root[data-mpce-modern]
  .jp-Notebook
  .jp-cell-toolbar
  .jp-ToolbarButtonComponent {
  border-radius: var(--mm-radius-sm);
}
`,""]),o.d(a,{},{A:l})},314(r){r.exports=function(r){var a=[];return a.toString=function(){return this.map(function(a){var o="",e=void 0!==a[5];return a[4]&&(o+="@supports (".concat(a[4],") {")),a[2]&&(o+="@media ".concat(a[2]," {")),e&&(o+="@layer".concat(a[5].length>0?" ".concat(a[5]):""," {")),o+=r(a),e&&(o+="}"),a[2]&&(o+="}"),a[4]&&(o+="}"),o}).join("")},a.i=function(r,o,e,t,d){"string"==typeof r&&(r=[[null,r,void 0]]);var m={};if(e)for(var n=0;n<this.length;n++){var p=this[n][0];null!=p&&(m[p]=!0)}for(var i=0;i<r.length;i++){var l=[].concat(r[i]);e&&m[l[0]]||(void 0!==d&&(void 0===l[5]||(l[1]="@layer".concat(l[5].length>0?" ".concat(l[5]):""," {").concat(l[1],"}")),l[5]=d),o&&(l[2]&&(l[1]="@media ".concat(l[2]," {").concat(l[1],"}")),l[2]=o),t&&(l[4]?(l[1]="@supports (".concat(l[4],") {").concat(l[1],"}"),l[4]=t):l[4]="".concat(t)),a.push(l))}},a}},417(r){r.exports=function(r,a){return(a||(a={}),r&&(r=String(r.__esModule?r.default:r),/^['"].*['"]$/.test(r)&&(r=r.slice(1,-1)),a.hash&&(r+=a.hash),/["'() \t\n]|(%20)/.test(r)||a.needQuotes))?'"'.concat(r.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):r}},601(r){r.exports=function(r){return r[1]}},320(r,a,o){o.r(a);var e=o(72),t=o.n(e),d=o(825),m=o.n(d),n=o(659),p=o.n(n),i=o(56),l=o.n(i),c=o(540),s=o.n(c),u=o(113),b=o.n(u),v=o(758),h={};h.styleTagTransform=b(),h.setAttributes=l(),h.insert=p().bind(null,"head"),h.domAPI=m(),h.insertStyleElement=s(),t()(v.A,h);let g=v.A&&v.A.locals?v.A.locals:void 0;o.d(a,{},{default:g})},72(r){var a=[];function o(r){for(var o=-1,e=0;e<a.length;e++)if(a[e].identifier===r){o=e;break}return o}function e(r,e){for(var t={},d=[],m=0;m<r.length;m++){var n=r[m],p=e.base?n[0]+e.base:n[0],i=t[p]||0,l="".concat(p," ").concat(i);t[p]=i+1;var c=o(l),s={css:n[1],media:n[2],sourceMap:n[3],supports:n[4],layer:n[5]};if(-1!==c)a[c].references++,a[c].updater(s);else{var u=function(r,a){var o=a.domAPI(a);return o.update(r),function(a){a?(a.css!==r.css||a.media!==r.media||a.sourceMap!==r.sourceMap||a.supports!==r.supports||a.layer!==r.layer)&&o.update(r=a):o.remove()}}(s,e);e.byIndex=m,a.splice(m,0,{identifier:l,updater:u,references:1})}d.push(l)}return d}r.exports=function(r,t){var d=e(r=r||[],t=t||{});return function(r){r=r||[];for(var m=0;m<d.length;m++){var n=o(d[m]);a[n].references--}for(var p=e(r,t),i=0;i<d.length;i++){var l=o(d[i]);0===a[l].references&&(a[l].updater(),a.splice(l,1))}d=p}}},659(r){var a={};r.exports=function(r,o){var e=function(r){if(void 0===a[r]){var o=document.querySelector(r);if(window.HTMLIFrameElement&&o instanceof window.HTMLIFrameElement)try{o=o.contentDocument.head}catch(r){o=null}a[r]=o}return a[r]}(r);if(!e)throw Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");e.appendChild(o)}},540(r){r.exports=function(r){var a=document.createElement("style");return r.setAttributes(a,r.attributes),r.insert(a,r.options),a}},56(r,a,o){r.exports=function(r){var a=o.nc;a&&r.setAttribute("nonce",a)}},825(r){r.exports=function(r){if("u"<typeof document)return{update:function(){},remove:function(){}};var a=r.insertStyleElement(r);return{update:function(o){var e,t,d;e="",o.supports&&(e+="@supports (".concat(o.supports,") {")),o.media&&(e+="@media ".concat(o.media," {")),(t=void 0!==o.layer)&&(e+="@layer".concat(o.layer.length>0?" ".concat(o.layer):""," {")),e+=o.css,t&&(e+="}"),o.media&&(e+="}"),o.supports&&(e+="}"),(d=o.sourceMap)&&"u">typeof btoa&&(e+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(d))))," */")),r.styleTagTransform(e,a,r.options)},remove:function(){var r;null===(r=a).parentNode||r.parentNode.removeChild(r)}}}},113(r){r.exports=function(r,a){if(a.styleSheet)a.styleSheet.cssText=r;else{for(;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(document.createTextNode(r))}}},411(r){r.exports="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M5 3.2v9.6c0 .4.4.6.8.4l7.2-4.8a.5.5 0 0 0 0-.8L5.8 2.8c-.4-.2-.8 0-.8.4z%27/%3E%3C/svg%3E"}}]);