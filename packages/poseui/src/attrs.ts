// =============================================================================
// HTML attribute type map — used by PoseElement to type-check .attr() calls.
//
// Design:
//   - AttrValue<T> = T | ((props: any) => T) is handled at the call site.
//   - Every attribute value here is the *static* accepted type.
//   - null always means "omit the attribute" — present in AttrValue via the
//     call-site union, not listed per-attribute.
//   - Boolean attributes (disabled, checked, readonly…) accept `""` (present)
//     or null (absent). We type them as `""` so the call site is explicit.
//   - Attributes shared by all elements live in GlobalAttrs.
//   - Per-element attrs extend GlobalAttrs via intersection at lookup time.
// =============================================================================

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

type Str = string;
type NumStr = number | string; // e.g. width, height, tabindex
type Bool = ""; // boolean attribute — pass "" to set, null to unset

// ---------------------------------------------------------------------------
// Shared value unions — reused across multiple elements
// ---------------------------------------------------------------------------

type Target = "_self" | "_blank" | "_parent" | "_top" | Str;
type Crossorigin = "anonymous" | "use-credentials" | "";
type Referrer =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";
type Dir = "ltr" | "rtl" | "auto";
type Loading = "eager" | "lazy";
type Decoding = "sync" | "async" | "auto";
type Preload = "none" | "metadata" | "auto" | "";
type Wrap = "soft" | "hard";
type Autocomplete =
  | "on"
  | "off"
  | "name"
  | "honorific-prefix"
  | "given-name"
  | "additional-name"
  | "family-name"
  | "honorific-suffix"
  | "nickname"
  | "email"
  | "username"
  | "new-password"
  | "current-password"
  | "one-time-code"
  | "organization-title"
  | "organization"
  | "street-address"
  | "address-line1"
  | "address-line2"
  | "address-line3"
  | "address-level4"
  | "address-level3"
  | "address-level2"
  | "address-level1"
  | "country"
  | "country-name"
  | "postal-code"
  | "cc-name"
  | "cc-given-name"
  | "cc-additional-name"
  | "cc-family-name"
  | "cc-number"
  | "cc-exp"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-csc"
  | "cc-type"
  | "transaction-currency"
  | "transaction-amount"
  | "language"
  | "bday"
  | "bday-day"
  | "bday-month"
  | "bday-year"
  | "sex"
  | "tel"
  | "tel-country-code"
  | "tel-national"
  | "tel-area-code"
  | "tel-local"
  | "tel-extension"
  | "impp"
  | "url"
  | "photo"
  | Str;

// ---------------------------------------------------------------------------
// ARIA attributes — shared by all elements
// ---------------------------------------------------------------------------

interface AriaAttrs {
  "aria-activedescendant": Str;
  "aria-atomic": "true" | "false";
  "aria-autocomplete": "none" | "inline" | "list" | "both";
  "aria-busy": "true" | "false";
  "aria-checked": "true" | "false" | "mixed";
  "aria-colcount": NumStr;
  "aria-colindex": NumStr;
  "aria-colspan": NumStr;
  "aria-controls": Str;
  "aria-current": "page" | "step" | "location" | "date" | "time" | "true" | "false";
  "aria-describedby": Str;
  "aria-details": Str;
  "aria-disabled": "true" | "false";
  "aria-dropeffect": "none" | "copy" | "execute" | "link" | "move" | "popup";
  "aria-errormessage": Str;
  "aria-expanded": "true" | "false";
  "aria-flowto": Str;
  "aria-grabbed": "true" | "false";
  "aria-haspopup": "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-hidden": "true" | "false";
  "aria-invalid": "true" | "false" | "grammar" | "spelling";
  "aria-keyshortcuts": Str;
  "aria-label": Str;
  "aria-labelledby": Str;
  "aria-level": NumStr;
  "aria-live": "off" | "assertive" | "polite";
  "aria-modal": "true" | "false";
  "aria-multiline": "true" | "false";
  "aria-multiselectable": "true" | "false";
  "aria-orientation": "horizontal" | "vertical";
  "aria-owns": Str;
  "aria-placeholder": Str;
  "aria-posinset": NumStr;
  "aria-pressed": "true" | "false" | "mixed";
  "aria-readonly": "true" | "false";
  "aria-relevant":
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text"
    | "text additions"
    | "text removals";
  "aria-required": "true" | "false";
  "aria-roledescription": Str;
  "aria-rowcount": NumStr;
  "aria-rowindex": NumStr;
  "aria-rowspan": NumStr;
  "aria-selected": "true" | "false";
  "aria-setsize": NumStr;
  "aria-sort": "ascending" | "descending" | "none" | "other";
  "aria-valuemax": NumStr;
  "aria-valuemin": NumStr;
  "aria-valuenow": NumStr;
  "aria-valuetext": Str;
  role:
    | "alert"
    | "alertdialog"
    | "application"
    | "article"
    | "banner"
    | "button"
    | "cell"
    | "checkbox"
    | "columnheader"
    | "combobox"
    | "complementary"
    | "contentinfo"
    | "definition"
    | "dialog"
    | "directory"
    | "document"
    | "feed"
    | "figure"
    | "form"
    | "grid"
    | "gridcell"
    | "group"
    | "heading"
    | "img"
    | "link"
    | "list"
    | "listbox"
    | "listitem"
    | "log"
    | "main"
    | "marquee"
    | "math"
    | "menu"
    | "menubar"
    | "menuitem"
    | "menuitemcheckbox"
    | "menuitemradio"
    | "navigation"
    | "none"
    | "note"
    | "option"
    | "presentation"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "region"
    | "row"
    | "rowgroup"
    | "rowheader"
    | "scrollbar"
    | "search"
    | "searchbox"
    | "separator"
    | "slider"
    | "spinbutton"
    | "status"
    | "switch"
    | "tab"
    | "table"
    | "tablist"
    | "tabpanel"
    | "term"
    | "textbox"
    | "timer"
    | "toolbar"
    | "tooltip"
    | "tree"
    | "treegrid"
    | "treeitem"
    | Str;
}

// ---------------------------------------------------------------------------
// Global attributes — valid on every HTML element
// ---------------------------------------------------------------------------

export interface GlobalAttrs extends AriaAttrs {
  accesskey: Str;
  autocapitalize: "off" | "none" | "on" | "sentences" | "words" | "characters";
  autofocus: Bool;
  class: Str;
  contenteditable: "true" | "false" | "inherit";
  "data-*": Str; // sentinel — handled specially at call site
  dir: Dir;
  draggable: "true" | "false";
  enterkeyhint: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  exportparts: Str;
  hidden: Bool;
  id: Str;
  inert: Bool;
  inputmode: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  is: Str;
  itemid: Str;
  itemprop: Str;
  itemref: Str;
  itemscope: Bool;
  itemtype: Str;
  lang: Str;
  nonce: Str;
  part: Str;
  popover: "auto" | "manual";
  slot: Str;
  spellcheck: "true" | "false";
  style: Str;
  tabindex: NumStr;
  title: Str;
  translate: "yes" | "no";
  virtualkeyboardpolicy: "auto" | "manual";
}

// ---------------------------------------------------------------------------
// Per-element attribute maps
// (IDL property names are normalised to their HTML content attribute names)
// ---------------------------------------------------------------------------

interface AnchorAttrs {
  download: Str;
  href: Str;
  hreflang: Str;
  media: Str;
  ping: Str;
  referrerpolicy: Referrer;
  rel:
    | "alternate"
    | "author"
    | "bookmark"
    | "canonical"
    | "dns-prefetch"
    | "external"
    | "help"
    | "icon"
    | "license"
    | "manifest"
    | "me"
    | "modulepreload"
    | "next"
    | "nofollow"
    | "noopener"
    | "noreferrer"
    | "opener"
    | "pingback"
    | "preconnect"
    | "prefetch"
    | "preload"
    | "prerender"
    | "prev"
    | "privacy-policy"
    | "search"
    | "stylesheet"
    | "tag"
    | "terms-of-service"
    | Str;
  shape: "rect" | "circle" | "poly" | "default";
  target: Target;
  type: Str;
}

interface ButtonAttrs {
  autofocus: Bool;
  disabled: Bool;
  form: Str;
  formaction: Str;
  formenctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
  formmethod: "get" | "post" | "dialog";
  formnovalidate: Bool;
  formtarget: Target;
  name: Str;
  popovertarget: Str;
  popovertargetaction: "hide" | "show" | "toggle";
  type: "submit" | "reset" | "button";
  value: Str;
}

interface InputAttrs {
  accept: Str;
  alt: Str;
  autocomplete: Autocomplete;
  autofocus: Bool;
  capture: "user" | "environment";
  checked: Bool;
  dirname: Str;
  disabled: Bool;
  form: Str;
  formaction: Str;
  formenctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
  formmethod: "get" | "post" | "dialog";
  formnovalidate: Bool;
  formtarget: Target;
  height: NumStr;
  list: Str;
  max: NumStr;
  maxlength: NumStr;
  min: NumStr;
  minlength: NumStr;
  multiple: Bool;
  name: Str;
  pattern: Str;
  placeholder: Str;
  popovertarget: Str;
  popovertargetaction: "hide" | "show" | "toggle";
  readonly: Bool;
  required: Bool;
  size: NumStr;
  src: Str;
  step: NumStr | "any";
  type:
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
  value: Str;
  width: NumStr;
}

interface TextareaAttrs {
  autocomplete: Autocomplete;
  autofocus: Bool;
  cols: NumStr;
  dirname: Str;
  disabled: Bool;
  form: Str;
  maxlength: NumStr;
  minlength: NumStr;
  name: Str;
  placeholder: Str;
  readonly: Bool;
  required: Bool;
  rows: NumStr;
  spellcheck: "true" | "false" | "default";
  wrap: Wrap;
}

interface SelectAttrs {
  autocomplete: Autocomplete;
  autofocus: Bool;
  disabled: Bool;
  form: Str;
  multiple: Bool;
  name: Str;
  required: Bool;
  size: NumStr;
}

interface OptionAttrs {
  disabled: Bool;
  label: Str;
  selected: Bool;
  value: Str;
}

interface OptgroupAttrs {
  disabled: Bool;
  label: Str;
}

interface FormAttrs {
  "accept-charset": Str;
  action: Str;
  autocomplete: "on" | "off";
  enctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
  method: "get" | "post" | "dialog";
  name: Str;
  novalidate: Bool;
  rel: Str;
  target: Target;
}

interface LabelAttrs {
  for: Str;
}

interface FieldsetAttrs {
  disabled: Bool;
  form: Str;
  name: Str;
}

interface ImgAttrs {
  alt: Str;
  crossorigin: Crossorigin;
  decoding: Decoding;
  elementtiming: Str;
  fetchpriority: "high" | "low" | "auto";
  height: NumStr;
  ismap: Bool;
  loading: Loading;
  referrerpolicy: Referrer;
  sizes: Str;
  src: Str;
  srcset: Str;
  usemap: Str;
  width: NumStr;
}

interface VideoAttrs {
  autoplay: Bool;
  controls: Bool;
  controlslist: "nodownload" | "nofullscreen" | "noremoteplayback" | Str;
  crossorigin: Crossorigin;
  disablepictureinpicture: Bool;
  disableremoteplayback: Bool;
  height: NumStr;
  loop: Bool;
  muted: Bool;
  playsinline: Bool;
  poster: Str;
  preload: Preload;
  src: Str;
  width: NumStr;
}

interface AudioAttrs {
  autoplay: Bool;
  controls: Bool;
  controlslist: Str;
  crossorigin: Crossorigin;
  disableremoteplayback: Bool;
  loop: Bool;
  muted: Bool;
  preload: Preload;
  src: Str;
}

interface SourceAttrs {
  height: NumStr;
  media: Str;
  sizes: Str;
  src: Str;
  srcset: Str;
  type: Str;
  width: NumStr;
}

interface TrackAttrs {
  default: Bool;
  kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
  label: Str;
  src: Str;
  srclang: Str;
}

interface IframeAttrs {
  allow: Str;
  allowfullscreen: Bool;
  height: NumStr;
  loading: Loading;
  name: Str;
  referrerpolicy: Referrer;
  sandbox:
    | "allow-downloads"
    | "allow-forms"
    | "allow-modals"
    | "allow-orientation-lock"
    | "allow-pointer-lock"
    | "allow-popups"
    | "allow-popups-to-escape-sandbox"
    | "allow-presentation"
    | "allow-same-origin"
    | "allow-scripts"
    | "allow-storage-access-by-user-activation"
    | "allow-top-navigation"
    | "allow-top-navigation-by-user-activation"
    | "allow-top-navigation-to-custom-protocols"
    | Str;
  src: Str;
  srcdoc: Str;
  width: NumStr;
}

interface ScriptAttrs {
  async: Bool;
  crossorigin: Crossorigin;
  defer: Bool;
  fetchpriority: "high" | "low" | "auto";
  integrity: Str;
  nomodule: Bool;
  nonce: Str;
  referrerpolicy: Referrer;
  src: Str;
  type: "module" | "importmap" | "speculationrules" | Str;
}

interface LinkAttrs {
  as:
    | "audio"
    | "document"
    | "embed"
    | "fetch"
    | "font"
    | "image"
    | "object"
    | "script"
    | "style"
    | "track"
    | "video"
    | "worker";
  blocking: Str;
  crossorigin: Crossorigin;
  disabled: Bool;
  fetchpriority: "high" | "low" | "auto";
  href: Str;
  hreflang: Str;
  imagesizes: Str;
  imagesrcset: Str;
  integrity: Str;
  media: Str;
  referrerpolicy: Referrer;
  rel:
    | "alternate"
    | "canonical"
    | "dns-prefetch"
    | "icon"
    | "manifest"
    | "modulepreload"
    | "next"
    | "pingback"
    | "preconnect"
    | "prefetch"
    | "preload"
    | "prerender"
    | "prev"
    | "search"
    | "stylesheet"
    | Str;
  sizes: Str;
  type: Str;
}

interface MetaAttrs {
  charset: Str;
  content: Str;
  "http-equiv":
    | "content-security-policy"
    | "content-type"
    | "default-style"
    | "x-ua-compatible"
    | "refresh";
  media: Str;
  name:
    | "application-name"
    | "author"
    | "description"
    | "generator"
    | "keywords"
    | "referrer"
    | "theme-color"
    | "color-scheme"
    | "viewport"
    | Str;
}

interface TableAttrs {
  summary: Str;
}

interface TdThAttrs {
  abbr: Str;
  colspan: NumStr;
  headers: Str;
  rowspan: NumStr;
  scope: "row" | "col" | "rowgroup" | "colgroup" | "auto";
}

interface ColAttrs {
  span: NumStr;
}

interface OlAttrs {
  reversed: Bool;
  start: NumStr;
  type: "1" | "a" | "A" | "i" | "I";
}

interface LiAttrs {
  value: NumStr;
}

interface DetailsAttrs {
  open: Bool;
  name: Str;
}

interface DialogAttrs {
  open: Bool;
}

interface CanvasAttrs {
  height: NumStr;
  width: NumStr;
}

interface MapAttrs {
  name: Str;
}

interface AreaAttrs {
  alt: Str;
  coords: Str;
  download: Str;
  href: Str;
  ping: Str;
  referrerpolicy: Referrer;
  rel: Str;
  shape: "rect" | "circle" | "poly" | "default";
  target: Target;
}

interface BlockquoteCiteAttrs {
  cite: Str;
}

interface TimeAttrs {
  datetime: Str;
}

interface DataAttrs {
  value: Str;
}

interface MeterAttrs {
  form: Str;
  high: NumStr;
  low: NumStr;
  max: NumStr;
  min: NumStr;
  optimum: NumStr;
  value: NumStr;
}

interface ProgressAttrs {
  max: NumStr;
  value: NumStr;
}

interface OutputAttrs {
  for: Str;
  form: Str;
  name: Str;
}

interface ObjectAttrs {
  data: Str;
  form: Str;
  height: NumStr;
  name: Str;
  type: Str;
  usemap: Str;
  width: NumStr;
}

interface SpanDivAttrs {
  // No element-specific attrs beyond globals — defined for completeness
}

// ---------------------------------------------------------------------------
// Tag → attribute map
// ---------------------------------------------------------------------------

export interface HTMLAttrMap {
  a: AnchorAttrs;
  abbr: SpanDivAttrs;
  address: SpanDivAttrs;
  area: AreaAttrs;
  article: SpanDivAttrs;
  aside: SpanDivAttrs;
  audio: AudioAttrs;
  b: SpanDivAttrs;
  blockquote: BlockquoteCiteAttrs;
  body: SpanDivAttrs;
  br: SpanDivAttrs;
  button: ButtonAttrs;
  canvas: CanvasAttrs;
  caption: SpanDivAttrs;
  cite: BlockquoteCiteAttrs;
  code: SpanDivAttrs;
  col: ColAttrs;
  colgroup: ColAttrs;
  data: DataAttrs;
  datalist: SpanDivAttrs;
  dd: SpanDivAttrs;
  del: BlockquoteCiteAttrs;
  details: DetailsAttrs;
  dfn: SpanDivAttrs;
  dialog: DialogAttrs;
  div: SpanDivAttrs;
  dl: SpanDivAttrs;
  dt: SpanDivAttrs;
  em: SpanDivAttrs;
  fieldset: FieldsetAttrs;
  figcaption: SpanDivAttrs;
  figure: SpanDivAttrs;
  footer: SpanDivAttrs;
  form: FormAttrs;
  h1: SpanDivAttrs;
  h2: SpanDivAttrs;
  h3: SpanDivAttrs;
  h4: SpanDivAttrs;
  h5: SpanDivAttrs;
  h6: SpanDivAttrs;
  head: SpanDivAttrs;
  header: SpanDivAttrs;
  hgroup: SpanDivAttrs;
  hr: SpanDivAttrs;
  html: SpanDivAttrs;
  i: SpanDivAttrs;
  iframe: IframeAttrs;
  img: ImgAttrs;
  input: InputAttrs;
  ins: BlockquoteCiteAttrs;
  kbd: SpanDivAttrs;
  label: LabelAttrs;
  legend: SpanDivAttrs;
  li: LiAttrs;
  link: LinkAttrs;
  main: SpanDivAttrs;
  map: MapAttrs;
  mark: SpanDivAttrs;
  menu: SpanDivAttrs;
  meta: MetaAttrs;
  meter: MeterAttrs;
  nav: SpanDivAttrs;
  noscript: SpanDivAttrs;
  object: ObjectAttrs;
  ol: OlAttrs;
  optgroup: OptgroupAttrs;
  option: OptionAttrs;
  output: OutputAttrs;
  p: SpanDivAttrs;
  picture: SpanDivAttrs;
  pre: SpanDivAttrs;
  progress: ProgressAttrs;
  q: BlockquoteCiteAttrs;
  rp: SpanDivAttrs;
  rt: SpanDivAttrs;
  ruby: SpanDivAttrs;
  s: SpanDivAttrs;
  samp: SpanDivAttrs;
  script: ScriptAttrs;
  search: SpanDivAttrs;
  section: SpanDivAttrs;
  select: SelectAttrs;
  slot: SpanDivAttrs;
  small: SpanDivAttrs;
  source: SourceAttrs;
  span: SpanDivAttrs;
  strong: SpanDivAttrs;
  style: SpanDivAttrs;
  sub: SpanDivAttrs;
  summary: SpanDivAttrs;
  sup: SpanDivAttrs;
  table: TableAttrs;
  tbody: SpanDivAttrs;
  td: TdThAttrs;
  template: SpanDivAttrs;
  textarea: TextareaAttrs;
  tfoot: SpanDivAttrs;
  th: TdThAttrs;
  thead: SpanDivAttrs;
  time: TimeAttrs;
  title: SpanDivAttrs;
  tr: SpanDivAttrs;
  track: TrackAttrs;
  u: SpanDivAttrs;
  ul: SpanDivAttrs;
  var: SpanDivAttrs;
  video: VideoAttrs;
  wbr: SpanDivAttrs;
}

// ---------------------------------------------------------------------------
// Public lookup types — used by PoseElement
// ---------------------------------------------------------------------------

/**
 * The merged attribute map for a given tag — element-specific attrs + globals.
 * Falls back to GlobalAttrs for unknown tags.
 */
export type AttrsFor<TTag extends string> = TTag extends keyof HTMLAttrMap
  ? HTMLAttrMap[TTag] & GlobalAttrs
  : GlobalAttrs;

/**
 * Valid attribute names for a given tag.
 * Includes `data-${string}` to allow arbitrary data attributes.
 */
export type AttrName<TTag extends string> =
  | keyof AttrsFor<TTag>
  | `data-${string}`
  | `aria-${string}`;

/**
 * The accepted value type for a specific attribute on a given tag.
 * Falls back to string for unknown attributes.
 */
export type AttrValueFor<
  TTag extends string,
  TName extends string,
> = TName extends keyof AttrsFor<TTag> ? AttrsFor<TTag>[TName] | null : string | null;
