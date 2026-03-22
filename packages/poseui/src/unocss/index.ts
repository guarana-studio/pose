// =============================================================================
// poseui/unocss
//
// UnoCSS extractor for .ts / .js files using poseui with the tailwind4 preset.
//
// Statically analyses source files for pose method call chains and emits the
// Tailwind class names they would produce at runtime — without executing code.
//
// Handles:
//   Zero-arg methods   .flex()              → "flex"
//   Single-arg methods .px(4)               → "px-4"
//                      .bg("indigo-600")    → "bg-indigo-600"
//                      .rounded("xl")       → "rounded-xl"
//                      .rounded()           → "rounded"
//   .cls() literals    .cls("ring-2 ...")   → each space-separated token
//   Dynamic args       .px(({ n }) => n)    → skipped (unknowable)
//
// Does NOT handle:
//   - Classes from runtime-only dynamic functions (correct — unknowable)
//   - basecoat preset class names (.btn(), .badge() etc.) — those are
//     basecoat CSS classes, not UnoCSS utilities, so UnoCSS doesn't need them
//
// Usage (uno.config.ts):
//   import { extractorPoseui } from "poseui/unocss";
//
//   export default defineConfig({
//     extractors: [extractorPoseui()],
//   });
// =============================================================================

import type { Extractor } from "@unocss/core";

// ---------------------------------------------------------------------------
// Method → class name mapping
//
// Derived directly from tailwind4.ts preset. Each entry is one of:
//   "static"   — zero-arg method, class name is the map value
//   "prefix"   — single-arg method, class = `${prefix}-${arg}`
//   "raw"      — single-arg method, class = arg verbatim (e.g. .bg(), .text_color())
//   "optional" — zero-arg = map value, one-arg = `${map value}-${arg}`
// ---------------------------------------------------------------------------

type MethodKind = "static" | "prefix" | "raw" | "optional";

interface MethodDef {
  kind: MethodKind;
  /** For "static"/"optional"/"prefix": the base class string.
   *  For "raw": unused (pass ""). */
  base: string;
}

const METHOD_MAP: Record<string, MethodDef> = {
  // ── Display ──────────────────────────────────────────────────────────────
  block: { kind: "static", base: "block" },
  inline: { kind: "static", base: "inline" },
  inline_block: { kind: "static", base: "inline-block" },
  flex: { kind: "static", base: "flex" },
  inline_flex: { kind: "static", base: "inline-flex" },
  grid: { kind: "static", base: "grid" },
  inline_grid: { kind: "static", base: "inline-grid" },
  flow_root: { kind: "static", base: "flow-root" },
  hidden: { kind: "static", base: "hidden" },
  contents: { kind: "static", base: "contents" },
  table_caption: { kind: "static", base: "table-caption" },
  table_cell: { kind: "static", base: "table-cell" },
  table_column: { kind: "static", base: "table-column" },
  table_column_group: { kind: "static", base: "table-column-group" },
  table_footer_group: { kind: "static", base: "table-footer-group" },
  table_header_group: { kind: "static", base: "table-header-group" },
  table_row_group: { kind: "static", base: "table-row-group" },
  table_row: { kind: "static", base: "table-row" },

  // ── Flexbox ──────────────────────────────────────────────────────────────
  flex_row: { kind: "static", base: "flex-row" },
  flex_row_reverse: { kind: "static", base: "flex-row-reverse" },
  flex_col: { kind: "static", base: "flex-col" },
  flex_col_reverse: { kind: "static", base: "flex-col-reverse" },
  flex_wrap: { kind: "static", base: "flex-wrap" },
  flex_wrap_reverse: { kind: "static", base: "flex-wrap-reverse" },
  flex_nowrap: { kind: "static", base: "flex-nowrap" },
  flex_1: { kind: "static", base: "flex-1" },
  flex_auto: { kind: "static", base: "flex-auto" },
  flex_initial: { kind: "static", base: "flex-initial" },
  flex_none: { kind: "static", base: "flex-none" },
  grow: { kind: "static", base: "grow" },
  grow_0: { kind: "static", base: "grow-0" },
  shrink: { kind: "static", base: "shrink" },
  shrink_0: { kind: "static", base: "shrink-0" },
  order: { kind: "prefix", base: "order" },
  order_first: { kind: "static", base: "order-first" },
  order_last: { kind: "static", base: "order-last" },
  order_none: { kind: "static", base: "order-none" },

  // ── Grid ─────────────────────────────────────────────────────────────────
  grid_cols: { kind: "prefix", base: "grid-cols" },
  grid_rows: { kind: "prefix", base: "grid-rows" },
  col_span: { kind: "prefix", base: "col-span" },
  col_start: { kind: "prefix", base: "col-start" },
  col_end: { kind: "prefix", base: "col-end" },
  row_span: { kind: "prefix", base: "row-span" },
  row_start: { kind: "prefix", base: "row-start" },
  row_end: { kind: "prefix", base: "row-end" },
  grid_flow_row: { kind: "static", base: "grid-flow-row" },
  grid_flow_col: { kind: "static", base: "grid-flow-col" },
  grid_flow_dense: { kind: "static", base: "grid-flow-dense" },
  auto_cols: { kind: "prefix", base: "auto-cols" },
  auto_rows: { kind: "prefix", base: "auto-rows" },

  // ── Alignment ────────────────────────────────────────────────────────────
  justify_start: { kind: "static", base: "justify-start" },
  justify_end: { kind: "static", base: "justify-end" },
  justify_center: { kind: "static", base: "justify-center" },
  justify_between: { kind: "static", base: "justify-between" },
  justify_around: { kind: "static", base: "justify-around" },
  justify_evenly: { kind: "static", base: "justify-evenly" },
  justify_items_start: { kind: "static", base: "justify-items-start" },
  justify_items_end: { kind: "static", base: "justify-items-end" },
  justify_items_center: { kind: "static", base: "justify-items-center" },
  justify_items_stretch: { kind: "static", base: "justify-items-stretch" },
  justify_self_auto: { kind: "static", base: "justify-self-auto" },
  justify_self_start: { kind: "static", base: "justify-self-start" },
  justify_self_end: { kind: "static", base: "justify-self-end" },
  justify_self_center: { kind: "static", base: "justify-self-center" },
  justify_self_stretch: { kind: "static", base: "justify-self-stretch" },
  items_start: { kind: "static", base: "items-start" },
  items_end: { kind: "static", base: "items-end" },
  items_center: { kind: "static", base: "items-center" },
  items_stretch: { kind: "static", base: "items-stretch" },
  items_baseline: { kind: "static", base: "items-baseline" },
  self_auto: { kind: "static", base: "self-auto" },
  self_start: { kind: "static", base: "self-start" },
  self_end: { kind: "static", base: "self-end" },
  self_center: { kind: "static", base: "self-center" },
  self_stretch: { kind: "static", base: "self-stretch" },
  self_baseline: { kind: "static", base: "self-baseline" },
  content_start: { kind: "static", base: "content-start" },
  content_end: { kind: "static", base: "content-end" },
  content_center: { kind: "static", base: "content-center" },
  content_between: { kind: "static", base: "content-between" },
  content_around: { kind: "static", base: "content-around" },
  content_evenly: { kind: "static", base: "content-evenly" },
  place_content: { kind: "prefix", base: "place-content" },
  place_items: { kind: "prefix", base: "place-items" },
  place_self: { kind: "prefix", base: "place-self" },

  // ── Spacing ──────────────────────────────────────────────────────────────
  gap: { kind: "prefix", base: "gap" },
  gap_0: { kind: "static", base: "gap-0" },
  gap_1: { kind: "static", base: "gap-1" },
  gap_2: { kind: "static", base: "gap-2" },
  gap_3: { kind: "static", base: "gap-3" },
  gap_4: { kind: "static", base: "gap-4" },
  gap_5: { kind: "static", base: "gap-5" },
  gap_6: { kind: "static", base: "gap-6" },
  gap_7: { kind: "static", base: "gap-7" },
  gap_8: { kind: "static", base: "gap-8" },
  gap_x: { kind: "prefix", base: "gap-x" },
  gap_y: { kind: "prefix", base: "gap-y" },
  space_x: { kind: "prefix", base: "space-x" },
  space_y: { kind: "prefix", base: "space-y" },
  space_x_reverse: { kind: "static", base: "space-x-reverse" },
  space_y_reverse: { kind: "static", base: "space-y-reverse" },
  p: { kind: "prefix", base: "p" },
  px: { kind: "prefix", base: "px" },
  py: { kind: "prefix", base: "py" },
  pt: { kind: "prefix", base: "pt" },
  pr: { kind: "prefix", base: "pr" },
  pb: { kind: "prefix", base: "pb" },
  pl: { kind: "prefix", base: "pl" },
  m: { kind: "prefix", base: "m" },
  mx: { kind: "prefix", base: "mx" },
  my: { kind: "prefix", base: "my" },
  mt: { kind: "prefix", base: "mt" },
  mr: { kind: "prefix", base: "mr" },
  mb: { kind: "prefix", base: "mb" },
  ml: { kind: "prefix", base: "ml" },
  m_auto: { kind: "static", base: "m-auto" },
  mx_auto: { kind: "static", base: "mx-auto" },
  my_auto: { kind: "static", base: "my-auto" },

  // ── Sizing ───────────────────────────────────────────────────────────────
  size: { kind: "prefix", base: "size" },
  w: { kind: "prefix", base: "w" },
  w_full: { kind: "static", base: "w-full" },
  w_screen: { kind: "static", base: "w-screen" },
  w_min: { kind: "static", base: "w-min" },
  w_max: { kind: "static", base: "w-max" },
  w_fit: { kind: "static", base: "w-fit" },
  h: { kind: "prefix", base: "h" },
  h_full: { kind: "static", base: "h-full" },
  h_screen: { kind: "static", base: "h-screen" },
  h_min: { kind: "static", base: "h-min" },
  h_max: { kind: "static", base: "h-max" },
  h_fit: { kind: "static", base: "h-fit" },
  min_w: { kind: "prefix", base: "min-w" },
  max_w: { kind: "prefix", base: "max-w" },
  min_h: { kind: "prefix", base: "min-h" },
  max_h: { kind: "prefix", base: "max-h" },
  aspect: { kind: "prefix", base: "aspect" },
  aspect_auto: { kind: "static", base: "aspect-auto" },
  aspect_square: { kind: "static", base: "aspect-square" },
  aspect_video: { kind: "static", base: "aspect-video" },

  // ── Position ─────────────────────────────────────────────────────────────
  static_pos: { kind: "static", base: "static" },
  relative: { kind: "static", base: "relative" },
  absolute: { kind: "static", base: "absolute" },
  fixed: { kind: "static", base: "fixed" },
  sticky: { kind: "static", base: "sticky" },
  inset: { kind: "prefix", base: "inset" },
  inset_0: { kind: "static", base: "inset-0" },
  inset_x: { kind: "prefix", base: "inset-x" },
  inset_y: { kind: "prefix", base: "inset-y" },
  top: { kind: "prefix", base: "top" },
  right: { kind: "prefix", base: "right" },
  bottom: { kind: "prefix", base: "bottom" },
  left: { kind: "prefix", base: "left" },
  z: { kind: "prefix", base: "z" },

  // ── Visibility ───────────────────────────────────────────────────────────
  visible: { kind: "static", base: "visible" },
  invisible: { kind: "static", base: "invisible" },

  // ── Float & Clear ────────────────────────────────────────────────────────
  float_left: { kind: "static", base: "float-left" },
  float_right: { kind: "static", base: "float-right" },
  float_none: { kind: "static", base: "float-none" },
  clear_left: { kind: "static", base: "clear-left" },
  clear_right: { kind: "static", base: "clear-right" },
  clear_both: { kind: "static", base: "clear-both" },
  clear_none: { kind: "static", base: "clear-none" },

  // ── Box Sizing ───────────────────────────────────────────────────────────
  box_border: { kind: "static", base: "box-border" },
  box_content: { kind: "static", base: "box-content" },

  // ── Overflow ─────────────────────────────────────────────────────────────
  overflow_auto: { kind: "static", base: "overflow-auto" },
  overflow_hidden: { kind: "static", base: "overflow-hidden" },
  overflow_clip: { kind: "static", base: "overflow-clip" },
  overflow_visible: { kind: "static", base: "overflow-visible" },
  overflow_scroll: { kind: "static", base: "overflow-scroll" },
  overflow_x_auto: { kind: "static", base: "overflow-x-auto" },
  overflow_x_hidden: { kind: "static", base: "overflow-x-hidden" },
  overflow_x_clip: { kind: "static", base: "overflow-x-clip" },
  overflow_x_visible: { kind: "static", base: "overflow-x-visible" },
  overflow_x_scroll: { kind: "static", base: "overflow-x-scroll" },
  overflow_y_auto: { kind: "static", base: "overflow-y-auto" },
  overflow_y_hidden: { kind: "static", base: "overflow-y-hidden" },
  overflow_y_clip: { kind: "static", base: "overflow-y-clip" },
  overflow_y_visible: { kind: "static", base: "overflow-y-visible" },
  overflow_y_scroll: { kind: "static", base: "overflow-y-scroll" },

  // ── Colours ──────────────────────────────────────────────────────────────
  // "raw" = arg is used directly as the suffix (bg-indigo-600, text-white etc.)
  bg: { kind: "raw", base: "bg" },
  text_color: { kind: "raw", base: "text" },
  opacity: { kind: "prefix", base: "opacity" },
  bg_opacity: { kind: "prefix", base: "bg-opacity" },

  // ── Background ───────────────────────────────────────────────────────────
  bg_clip: { kind: "raw", base: "bg-clip" }, // bg-clip-border etc.
  bg_size: { kind: "raw", base: "" }, // bg-cover, bg-contain
  bg_position: { kind: "raw", base: "" }, // bg-center etc.
  bg_attachment: { kind: "raw", base: "" }, // bg-fixed etc.
  bg_gradient: { kind: "prefix", base: "bg-gradient-to" },
  from: { kind: "raw", base: "from" },
  via: { kind: "raw", base: "via" },
  to: { kind: "raw", base: "to" },

  // ── Border ───────────────────────────────────────────────────────────────
  border: { kind: "static", base: "border" },
  border_w: { kind: "prefix", base: "border" },
  border_t: { kind: "optional", base: "border-t" },
  border_r: { kind: "optional", base: "border-r" },
  border_b: { kind: "optional", base: "border-b" },
  border_l: { kind: "optional", base: "border-l" },
  border_x: { kind: "optional", base: "border-x" },
  border_y: { kind: "optional", base: "border-y" },
  border_color: { kind: "raw", base: "border" },
  border_solid: { kind: "static", base: "border-solid" },
  border_dashed: { kind: "static", base: "border-dashed" },
  border_dotted: { kind: "static", base: "border-dotted" },
  border_double: { kind: "static", base: "border-double" },
  border_none: { kind: "static", base: "border-none" },
  border_collapse: { kind: "static", base: "border-collapse" },
  border_separate: { kind: "static", base: "border-separate" },
  rounded: { kind: "optional", base: "rounded" },
  rounded_full: { kind: "static", base: "rounded-full" },
  rounded_t: { kind: "optional", base: "rounded-t" },
  rounded_r: { kind: "optional", base: "rounded-r" },
  rounded_b: { kind: "optional", base: "rounded-b" },
  rounded_l: { kind: "optional", base: "rounded-l" },

  // ── Divide ───────────────────────────────────────────────────────────────
  divide_x: { kind: "optional", base: "divide-x" },
  divide_y: { kind: "optional", base: "divide-y" },
  divide_x_reverse: { kind: "static", base: "divide-x-reverse" },
  divide_y_reverse: { kind: "static", base: "divide-y-reverse" },
  divide_color: { kind: "raw", base: "divide" },
  divide_solid: { kind: "static", base: "divide-solid" },
  divide_dashed: { kind: "static", base: "divide-dashed" },
  divide_dotted: { kind: "static", base: "divide-dotted" },
  divide_none: { kind: "static", base: "divide-none" },

  // ── Ring ─────────────────────────────────────────────────────────────────
  ring: { kind: "static", base: "ring" },
  ring_w: { kind: "prefix", base: "ring" },
  ring_inset: { kind: "static", base: "ring-inset" },
  ring_color: { kind: "raw", base: "ring" },
  ring_offset: { kind: "prefix", base: "ring-offset" },
  ring_offset_color: { kind: "raw", base: "ring-offset" },

  // ── Outline ──────────────────────────────────────────────────────────────
  outline_none: { kind: "static", base: "outline-none" },
  outline: { kind: "static", base: "outline" },
  outline_dashed: { kind: "static", base: "outline-dashed" },
  outline_dotted: { kind: "static", base: "outline-dotted" },
  outline_double: { kind: "static", base: "outline-double" },
  outline_color: { kind: "raw", base: "outline" },
  outline_w: { kind: "prefix", base: "outline" },
  outline_offset: { kind: "prefix", base: "outline-offset" },

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadow: { kind: "static", base: "shadow" },
  shadow_sm: { kind: "static", base: "shadow-sm" },
  shadow_md: { kind: "static", base: "shadow-md" },
  shadow_lg: { kind: "static", base: "shadow-lg" },
  shadow_xl: { kind: "static", base: "shadow-xl" },
  shadow_2xl: { kind: "static", base: "shadow-2xl" },
  shadow_inner: { kind: "static", base: "shadow-inner" },
  shadow_none: { kind: "static", base: "shadow-none" },
  shadow_color: { kind: "raw", base: "shadow" },

  // ── Typography ───────────────────────────────────────────────────────────
  text: { kind: "raw", base: "text" },
  text_xs: { kind: "static", base: "text-xs" },
  text_sm: { kind: "static", base: "text-sm" },
  text_base: { kind: "static", base: "text-base" },
  text_lg: { kind: "static", base: "text-lg" },
  text_xl: { kind: "static", base: "text-xl" },
  text_2xl: { kind: "static", base: "text-2xl" },
  text_3xl: { kind: "static", base: "text-3xl" },
  text_4xl: { kind: "static", base: "text-4xl" },
  text_5xl: { kind: "static", base: "text-5xl" },
  text_6xl: { kind: "static", base: "text-6xl" },
  text_7xl: { kind: "static", base: "text-7xl" },
  text_8xl: { kind: "static", base: "text-8xl" },
  text_9xl: { kind: "static", base: "text-9xl" },
  font_thin: { kind: "static", base: "font-thin" },
  font_extralight: { kind: "static", base: "font-extralight" },
  font_light: { kind: "static", base: "font-light" },
  font_normal: { kind: "static", base: "font-normal" },
  font_medium: { kind: "static", base: "font-medium" },
  font_semibold: { kind: "static", base: "font-semibold" },
  font_bold: { kind: "static", base: "font-bold" },
  font_extrabold: { kind: "static", base: "font-extrabold" },
  font_black: { kind: "static", base: "font-black" },
  italic: { kind: "static", base: "italic" },
  not_italic: { kind: "static", base: "not-italic" },
  text_left: { kind: "static", base: "text-left" },
  text_center: { kind: "static", base: "text-center" },
  text_right: { kind: "static", base: "text-right" },
  text_justify: { kind: "static", base: "text-justify" },
  text_wrap: { kind: "static", base: "text-wrap" },
  text_nowrap: { kind: "static", base: "text-nowrap" },
  text_balance: { kind: "static", base: "text-balance" },
  text_pretty: { kind: "static", base: "text-pretty" },
  truncate: { kind: "static", base: "truncate" },
  text_ellipsis: { kind: "static", base: "text-ellipsis" },
  text_clip: { kind: "static", base: "text-clip" },
  leading: { kind: "prefix", base: "leading" },
  tracking: { kind: "prefix", base: "tracking" },
  line_clamp: { kind: "prefix", base: "line-clamp" },
  whitespace: { kind: "prefix", base: "whitespace" },
  break_normal: { kind: "static", base: "break-normal" },
  break_words: { kind: "static", base: "break-words" },
  break_all: { kind: "static", base: "break-all" },
  break_keep: { kind: "static", base: "break-keep" },
  uppercase: { kind: "static", base: "uppercase" },
  lowercase: { kind: "static", base: "lowercase" },
  capitalize: { kind: "static", base: "capitalize" },
  normal_case: { kind: "static", base: "normal-case" },
  underline: { kind: "static", base: "underline" },
  overline: { kind: "static", base: "overline" },
  line_through: { kind: "static", base: "line-through" },
  no_underline: { kind: "static", base: "no-underline" },
  decoration_color: { kind: "raw", base: "decoration" },
  indent: { kind: "prefix", base: "indent" },
  align: { kind: "prefix", base: "align" },
  font_family: { kind: "prefix", base: "font" },

  // ── List ─────────────────────────────────────────────────────────────────
  list_none: { kind: "static", base: "list-none" },
  list_disc: { kind: "static", base: "list-disc" },
  list_decimal: { kind: "static", base: "list-decimal" },
  list_inside: { kind: "static", base: "list-inside" },
  list_outside: { kind: "static", base: "list-outside" },

  // ── Object ───────────────────────────────────────────────────────────────
  object_contain: { kind: "static", base: "object-contain" },
  object_cover: { kind: "static", base: "object-cover" },
  object_fill: { kind: "static", base: "object-fill" },
  object_none: { kind: "static", base: "object-none" },
  object_scale_down: { kind: "static", base: "object-scale-down" },
  object_position: { kind: "raw", base: "object" },

  // ── Transforms ───────────────────────────────────────────────────────────
  scale: { kind: "prefix", base: "scale" },
  scale_x: { kind: "prefix", base: "scale-x" },
  scale_y: { kind: "prefix", base: "scale-y" },
  rotate: { kind: "prefix", base: "rotate" },
  translate_x: { kind: "prefix", base: "translate-x" },
  translate_y: { kind: "prefix", base: "translate-y" },
  skew_x: { kind: "prefix", base: "skew-x" },
  skew_y: { kind: "prefix", base: "skew-y" },
  origin: { kind: "prefix", base: "origin" },

  // ── Filters ──────────────────────────────────────────────────────────────
  blur: { kind: "optional", base: "blur" },
  brightness: { kind: "prefix", base: "brightness" },
  contrast: { kind: "prefix", base: "contrast" },
  grayscale: { kind: "optional", base: "grayscale" },
  hue_rotate: { kind: "prefix", base: "hue-rotate" },
  invert: { kind: "optional", base: "invert" },
  saturate: { kind: "prefix", base: "saturate" },
  sepia: { kind: "optional", base: "sepia" },
  drop_shadow: { kind: "optional", base: "drop-shadow" },
  backdrop_blur: { kind: "optional", base: "backdrop-blur" },
  backdrop_brightness: { kind: "prefix", base: "backdrop-brightness" },

  // ── Animation ────────────────────────────────────────────────────────────
  animate_none: { kind: "static", base: "animate-none" },
  animate_spin: { kind: "static", base: "animate-spin" },
  animate_ping: { kind: "static", base: "animate-ping" },
  animate_pulse: { kind: "static", base: "animate-pulse" },
  animate_bounce: { kind: "static", base: "animate-bounce" },
  transition: { kind: "static", base: "transition" },
  transition_prop: { kind: "raw", base: "transition" },
  duration: { kind: "prefix", base: "duration" },
  delay: { kind: "prefix", base: "delay" },
  ease: { kind: "prefix", base: "ease" },
  will_change: { kind: "prefix", base: "will-change" },

  // ── Interactivity ────────────────────────────────────────────────────────
  cursor_auto: { kind: "static", base: "cursor-auto" },
  cursor_default: { kind: "static", base: "cursor-default" },
  cursor_pointer: { kind: "static", base: "cursor-pointer" },
  cursor_wait: { kind: "static", base: "cursor-wait" },
  cursor_text: { kind: "static", base: "cursor-text" },
  cursor_move: { kind: "static", base: "cursor-move" },
  cursor_not_allowed: { kind: "static", base: "cursor-not-allowed" },
  cursor_grab: { kind: "static", base: "cursor-grab" },
  cursor_grabbing: { kind: "static", base: "cursor-grabbing" },
  cursor_crosshair: { kind: "static", base: "cursor-crosshair" },
  select_none: { kind: "static", base: "select-none" },
  select_text: { kind: "static", base: "select-text" },
  select_all: { kind: "static", base: "select-all" },
  select_auto: { kind: "static", base: "select-auto" },
  resize_none: { kind: "static", base: "resize-none" },
  resize: { kind: "static", base: "resize" },
  resize_x: { kind: "static", base: "resize-x" },
  resize_y: { kind: "static", base: "resize-y" },
  pointer_events_none: { kind: "static", base: "pointer-events-none" },
  pointer_events_auto: { kind: "static", base: "pointer-events-auto" },
  touch_auto: { kind: "static", base: "touch-auto" },
  touch_none: { kind: "static", base: "touch-none" },
  touch_pan_x: { kind: "static", base: "touch-pan-x" },
  touch_pan_y: { kind: "static", base: "touch-pan-y" },
  touch_manipulation: { kind: "static", base: "touch-manipulation" },
  appearance_none: { kind: "static", base: "appearance-none" },

  // ── Mix blend ────────────────────────────────────────────────────────────
  mix_blend: { kind: "prefix", base: "mix-blend" },

  // ── SVG ──────────────────────────────────────────────────────────────────
  fill: { kind: "raw", base: "fill" },
  stroke: { kind: "raw", base: "stroke" },
  stroke_w: { kind: "prefix", base: "stroke" },

  // ── Accessibility ────────────────────────────────────────────────────────
  sr_only: { kind: "static", base: "sr-only" },
  not_sr_only: { kind: "static", base: "not-sr-only" },
};

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

// Matches .methodName(arg) — arg is the raw content between the parens,
// which may be empty, a number, a quoted string, or a function (=>).
// We capture the method name and the raw arg string separately.
//
// Examples matched:
//   .flex()              → method="flex",  arg=""
//   .px(4)               → method="px",    arg="4"
//   .bg("indigo-600")    → method="bg",    arg='"indigo-600"'
//   .rounded("xl")       → method="rounded", arg='"xl"'
//   .opacity(({ a }) => a) → method="opacity", arg="({ a }) => a"  (dynamic, skipped)
//   .cls("ring-2 mt-4")  → method="cls",   arg='"ring-2 mt-4"'

const CALL_RE = /\.([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)/g;

// Matches a single- or double-quoted string literal, capturing the inner value
const STRING_LITERAL_RE = /^['"](.+?)['"]$/;

// Matches a bare number (integer or decimal)
const NUMBER_RE = /^\d+(\.\d+)?$/;

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse the raw argument string from inside the parentheses.
 * Returns the string value if it's a static literal/number, or null if dynamic.
 */
function parseArg(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null; // empty = no arg

  // Quoted string literal: "indigo-600" or 'xl'
  const strMatch = trimmed.match(STRING_LITERAL_RE);
  if (strMatch) return strMatch[1] ?? null;

  // Bare number: 4, 2.5
  if (NUMBER_RE.test(trimmed)) return trimmed;

  // Anything else (arrow function, variable reference, template literal) → dynamic
  return null;
}

// ---------------------------------------------------------------------------
// Class name derivation
// ---------------------------------------------------------------------------

/**
 * Given a method name and its parsed argument, return the Tailwind class
 * string it would produce, or null if it can't be determined statically.
 */
function deriveClass(method: string, rawArg: string): string | null {
  const def = METHOD_MAP[method];
  if (!def) return null;

  switch (def.kind) {
    case "static":
      // Zero-arg methods — always safe to emit
      return def.base;

    case "prefix": {
      // Must have a static arg: .px(4) → "px-4", .bg_gradient("t") → "bg-gradient-to-t"
      const arg = parseArg(rawArg);
      if (!arg) return null;
      return `${def.base}-${arg}`;
    }

    case "raw": {
      // Arg used as-is as the suffix: .bg("indigo-600") → "bg-indigo-600"
      const arg = parseArg(rawArg);
      if (!arg) return null;
      return def.base ? `${def.base}-${arg}` : arg;
    }

    case "optional": {
      // Zero-arg → base class; one-arg → base-arg: .rounded() / .rounded("xl")
      const trimmed = rawArg.trim();
      if (!trimmed) return def.base;
      const arg = parseArg(rawArg);
      if (!arg) return null;
      return `${def.base}-${arg}`;
    }
  }
}

// ---------------------------------------------------------------------------
// .cls() handling
// ---------------------------------------------------------------------------

/**
 * Extract class names from .cls("ring-2 mt-4 ...") calls.
 * Splits on whitespace and returns each token.
 * Returns [] if the argument is dynamic.
 */
function extractClsClasses(rawArg: string): string[] {
  const arg = parseArg(rawArg);
  if (!arg) return [];
  return arg.split(/\s+/).filter(Boolean);
}

// ---------------------------------------------------------------------------
// File filter
// ---------------------------------------------------------------------------

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"];

function isSupportedFile(id: string): boolean {
  return SUPPORTED_EXTENSIONS.some((ext) => id.endsWith(ext));
}

// ---------------------------------------------------------------------------
// Extractor
// ---------------------------------------------------------------------------

export function extractorPoseui(): Extractor {
  return {
    name: "poseui",

    // Run before the default extractor (order 0) so our results are present
    // when UnoCSS processes the file. The default extractor still runs and
    // may pick up additional classes from string literals in the same file.
    order: -1,

    extract({ id, code, extracted }) {
      if (!id || !isSupportedFile(id)) return;

      // Reset lastIndex between calls — CALL_RE is stateful
      CALL_RE.lastIndex = 0;

      let match: RegExpExecArray | null;

      while ((match = CALL_RE.exec(code)) !== null) {
        const [, method, rawArg] = match;

        if (method === "cls") {
          // .cls("ring-2 mt-4") — may contain multiple classes
          for (const cls of extractClsClasses(rawArg ?? "")) {
            extracted.add(cls);
          }
          continue;
        }

        const className = deriveClass(method ?? "", rawArg ?? "");
        if (className) {
          extracted.add(className);
        }
      }
    },
  };
}
