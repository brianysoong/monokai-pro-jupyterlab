"use strict";(self.rspackChunkjupyterlab_monokai_pro_ce=self.rspackChunkjupyterlab_monokai_pro_ce||[]).push([[689],{758(a,r,o){var e=o(601),t=o.n(e),d=o(314),m=(o.n(d))()(t());m.push([a.id,`/* -----------------------------------------------------------------------------
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
`,""]),o.d(r,{},{A:m})},314(a){a.exports=function(a){var r=[];return r.toString=function(){return this.map(function(r){var o="",e=void 0!==r[5];return r[4]&&(o+="@supports (".concat(r[4],") {")),r[2]&&(o+="@media ".concat(r[2]," {")),e&&(o+="@layer".concat(r[5].length>0?" ".concat(r[5]):""," {")),o+=a(r),e&&(o+="}"),r[2]&&(o+="}"),r[4]&&(o+="}"),o}).join("")},r.i=function(a,o,e,t,d){"string"==typeof a&&(a=[[null,a,void 0]]);var m={};if(e)for(var n=0;n<this.length;n++){var i=this[n][0];null!=i&&(m[i]=!0)}for(var p=0;p<a.length;p++){var c=[].concat(a[p]);e&&m[c[0]]||(void 0!==d&&(void 0===c[5]||(c[1]="@layer".concat(c[5].length>0?" ".concat(c[5]):""," {").concat(c[1],"}")),c[5]=d),o&&(c[2]&&(c[1]="@media ".concat(c[2]," {").concat(c[1],"}")),c[2]=o),t&&(c[4]?(c[1]="@supports (".concat(c[4],") {").concat(c[1],"}"),c[4]=t):c[4]="".concat(t)),r.push(c))}},r}},601(a){a.exports=function(a){return a[1]}},320(a,r,o){o.r(r);var e=o(72),t=o.n(e),d=o(825),m=o.n(d),n=o(659),i=o.n(n),p=o(56),c=o.n(p),s=o(540),l=o.n(s),b=o(113),u=o.n(b),v=o(758),h={};h.styleTagTransform=u(),h.setAttributes=c(),h.insert=i().bind(null,"head"),h.domAPI=m(),h.insertStyleElement=l(),t()(v.A,h);let g=v.A&&v.A.locals?v.A.locals:void 0;o.d(r,{},{default:g})},72(a){var r=[];function o(a){for(var o=-1,e=0;e<r.length;e++)if(r[e].identifier===a){o=e;break}return o}function e(a,e){for(var t={},d=[],m=0;m<a.length;m++){var n=a[m],i=e.base?n[0]+e.base:n[0],p=t[i]||0,c="".concat(i," ").concat(p);t[i]=p+1;var s=o(c),l={css:n[1],media:n[2],sourceMap:n[3],supports:n[4],layer:n[5]};if(-1!==s)r[s].references++,r[s].updater(l);else{var b=function(a,r){var o=r.domAPI(r);return o.update(a),function(r){r?(r.css!==a.css||r.media!==a.media||r.sourceMap!==a.sourceMap||r.supports!==a.supports||r.layer!==a.layer)&&o.update(a=r):o.remove()}}(l,e);e.byIndex=m,r.splice(m,0,{identifier:c,updater:b,references:1})}d.push(c)}return d}a.exports=function(a,t){var d=e(a=a||[],t=t||{});return function(a){a=a||[];for(var m=0;m<d.length;m++){var n=o(d[m]);r[n].references--}for(var i=e(a,t),p=0;p<d.length;p++){var c=o(d[p]);0===r[c].references&&(r[c].updater(),r.splice(c,1))}d=i}}},659(a){var r={};a.exports=function(a,o){var e=function(a){if(void 0===r[a]){var o=document.querySelector(a);if(window.HTMLIFrameElement&&o instanceof window.HTMLIFrameElement)try{o=o.contentDocument.head}catch(a){o=null}r[a]=o}return r[a]}(a);if(!e)throw Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");e.appendChild(o)}},540(a){a.exports=function(a){var r=document.createElement("style");return a.setAttributes(r,a.attributes),a.insert(r,a.options),r}},56(a,r,o){a.exports=function(a){var r=o.nc;r&&a.setAttribute("nonce",r)}},825(a){a.exports=function(a){if("u"<typeof document)return{update:function(){},remove:function(){}};var r=a.insertStyleElement(a);return{update:function(o){var e,t,d;e="",o.supports&&(e+="@supports (".concat(o.supports,") {")),o.media&&(e+="@media ".concat(o.media," {")),(t=void 0!==o.layer)&&(e+="@layer".concat(o.layer.length>0?" ".concat(o.layer):""," {")),e+=o.css,t&&(e+="}"),o.media&&(e+="}"),o.supports&&(e+="}"),(d=o.sourceMap)&&"u">typeof btoa&&(e+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(d))))," */")),a.styleTagTransform(e,r,a.options)},remove:function(){var a;null===(a=r).parentNode||a.parentNode.removeChild(a)}}}},113(a){a.exports=function(a,r){if(r.styleSheet)r.styleSheet.cssText=a;else{for(;r.firstChild;)r.removeChild(r.firstChild);r.appendChild(document.createTextNode(a))}}}}]);