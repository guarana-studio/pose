// =============================================================================
// poseui/presets — Tailwind v4 / UnoCSS presetWind4 fluent methods
//
// Import this file to get both:
//   - runtime: all utility methods attached to every PoseElement
//   - types:   declaration merging that adds those methods to PoseElement<T, S>
//
// Usage:
//   import { createPose } from "poseui";
//   import { tailwind4 } from "poseui/presets";
//
//   const pose = createPose({ presets: [tailwind4] });
//   pose.as("div").flex().p(4).bg("indigo-600");
// =============================================================================

import type { PoseElement, Dyn, Preset } from "poseui";

// ---------------------------------------------------------------------------
// Helpers (mirror of the private tw/arbitrary in index.ts — kept local so
// tailwind4.ts has zero runtime coupling to pose internals)
// ---------------------------------------------------------------------------

function tw(prefix: string, value: number | string): string {
  return `${prefix}-${value}`;
}

function arbitrary(value: string): string {
  return /^[\w./#%-]+$/.test(value) ? value : `[${value}]`;
}

// ---------------------------------------------------------------------------
// Declaration merging — augments PoseElement with all Tailwind utility methods
// ---------------------------------------------------------------------------

declare module "poseui" {
  interface PoseElement<
    TProps extends Record<string, unknown>,
    TSchema,
    TTag extends string = string,
  > {
    // ── Display ──────────────────────────────────────────────────────────────
    block(): PoseElement<TProps, TSchema, TTag>;
    inline(): PoseElement<TProps, TSchema, TTag>;
    inline_block(): PoseElement<TProps, TSchema, TTag>;
    flex(): PoseElement<TProps, TSchema, TTag>;
    inline_flex(): PoseElement<TProps, TSchema, TTag>;
    grid(): PoseElement<TProps, TSchema, TTag>;
    inline_grid(): PoseElement<TProps, TSchema, TTag>;
    flow_root(): PoseElement<TProps, TSchema, TTag>;
    hidden(): PoseElement<TProps, TSchema, TTag>;
    contents(): PoseElement<TProps, TSchema, TTag>;
    table(): PoseElement<TProps, TSchema, TTag>;
    table_caption(): PoseElement<TProps, TSchema, TTag>;
    table_cell(): PoseElement<TProps, TSchema, TTag>;
    table_column(): PoseElement<TProps, TSchema, TTag>;
    table_column_group(): PoseElement<TProps, TSchema, TTag>;
    table_footer_group(): PoseElement<TProps, TSchema, TTag>;
    table_header_group(): PoseElement<TProps, TSchema, TTag>;
    table_row_group(): PoseElement<TProps, TSchema, TTag>;
    table_row(): PoseElement<TProps, TSchema, TTag>;

    // ── Flexbox ──────────────────────────────────────────────────────────────
    flex_row(): PoseElement<TProps, TSchema, TTag>;
    flex_row_reverse(): PoseElement<TProps, TSchema, TTag>;
    flex_col(): PoseElement<TProps, TSchema, TTag>;
    flex_col_reverse(): PoseElement<TProps, TSchema, TTag>;
    flex_wrap(): PoseElement<TProps, TSchema, TTag>;
    flex_wrap_reverse(): PoseElement<TProps, TSchema, TTag>;
    flex_nowrap(): PoseElement<TProps, TSchema, TTag>;
    flex_1(): PoseElement<TProps, TSchema, TTag>;
    flex_auto(): PoseElement<TProps, TSchema, TTag>;
    flex_initial(): PoseElement<TProps, TSchema, TTag>;
    flex_none(): PoseElement<TProps, TSchema, TTag>;
    grow(): PoseElement<TProps, TSchema, TTag>;
    grow_0(): PoseElement<TProps, TSchema, TTag>;
    shrink(): PoseElement<TProps, TSchema, TTag>;
    shrink_0(): PoseElement<TProps, TSchema, TTag>;
    order(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    order_first(): PoseElement<TProps, TSchema, TTag>;
    order_last(): PoseElement<TProps, TSchema, TTag>;
    order_none(): PoseElement<TProps, TSchema, TTag>;

    // ── Grid ─────────────────────────────────────────────────────────────────
    grid_cols(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    grid_rows(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    col_span(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    col_start(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    col_end(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    row_span(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    row_start(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    row_end(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    grid_flow_row(): PoseElement<TProps, TSchema, TTag>;
    grid_flow_col(): PoseElement<TProps, TSchema, TTag>;
    grid_flow_dense(): PoseElement<TProps, TSchema, TTag>;
    auto_cols(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    auto_rows(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Alignment ────────────────────────────────────────────────────────────
    justify_start(): PoseElement<TProps, TSchema, TTag>;
    justify_end(): PoseElement<TProps, TSchema, TTag>;
    justify_center(): PoseElement<TProps, TSchema, TTag>;
    justify_between(): PoseElement<TProps, TSchema, TTag>;
    justify_around(): PoseElement<TProps, TSchema, TTag>;
    justify_evenly(): PoseElement<TProps, TSchema, TTag>;
    justify_items_start(): PoseElement<TProps, TSchema, TTag>;
    justify_items_end(): PoseElement<TProps, TSchema, TTag>;
    justify_items_center(): PoseElement<TProps, TSchema, TTag>;
    justify_items_stretch(): PoseElement<TProps, TSchema, TTag>;
    justify_self_auto(): PoseElement<TProps, TSchema, TTag>;
    justify_self_start(): PoseElement<TProps, TSchema, TTag>;
    justify_self_end(): PoseElement<TProps, TSchema, TTag>;
    justify_self_center(): PoseElement<TProps, TSchema, TTag>;
    justify_self_stretch(): PoseElement<TProps, TSchema, TTag>;
    items_start(): PoseElement<TProps, TSchema, TTag>;
    items_end(): PoseElement<TProps, TSchema, TTag>;
    items_center(): PoseElement<TProps, TSchema, TTag>;
    items_stretch(): PoseElement<TProps, TSchema, TTag>;
    items_baseline(): PoseElement<TProps, TSchema, TTag>;
    self_auto(): PoseElement<TProps, TSchema, TTag>;
    self_start(): PoseElement<TProps, TSchema, TTag>;
    self_end(): PoseElement<TProps, TSchema, TTag>;
    self_center(): PoseElement<TProps, TSchema, TTag>;
    self_stretch(): PoseElement<TProps, TSchema, TTag>;
    self_baseline(): PoseElement<TProps, TSchema, TTag>;
    content_start(): PoseElement<TProps, TSchema, TTag>;
    content_end(): PoseElement<TProps, TSchema, TTag>;
    content_center(): PoseElement<TProps, TSchema, TTag>;
    content_between(): PoseElement<TProps, TSchema, TTag>;
    content_around(): PoseElement<TProps, TSchema, TTag>;
    content_evenly(): PoseElement<TProps, TSchema, TTag>;
    place_content(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    place_items(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    place_self(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Spacing ──────────────────────────────────────────────────────────────
    gap(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    gap_0(): PoseElement<TProps, TSchema, TTag>;
    gap_1(): PoseElement<TProps, TSchema, TTag>;
    gap_2(): PoseElement<TProps, TSchema, TTag>;
    gap_3(): PoseElement<TProps, TSchema, TTag>;
    gap_4(): PoseElement<TProps, TSchema, TTag>;
    gap_5(): PoseElement<TProps, TSchema, TTag>;
    gap_6(): PoseElement<TProps, TSchema, TTag>;
    gap_7(): PoseElement<TProps, TSchema, TTag>;
    gap_8(): PoseElement<TProps, TSchema, TTag>;
    gap_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    gap_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    space_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    space_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    space_x_reverse(): PoseElement<TProps, TSchema, TTag>;
    space_y_reverse(): PoseElement<TProps, TSchema, TTag>;
    p(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    px(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    py(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    pt(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    pr(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    pb(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    pl(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    m(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    mx(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    my(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    mt(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    mr(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    mb(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    ml(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    m_auto(): PoseElement<TProps, TSchema, TTag>;
    mx_auto(): PoseElement<TProps, TSchema, TTag>;
    my_auto(): PoseElement<TProps, TSchema, TTag>;

    // ── Sizing ───────────────────────────────────────────────────────────────
    size(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    w_full(): PoseElement<TProps, TSchema, TTag>;
    w_screen(): PoseElement<TProps, TSchema, TTag>;
    w_min(): PoseElement<TProps, TSchema, TTag>;
    w_max(): PoseElement<TProps, TSchema, TTag>;
    w_fit(): PoseElement<TProps, TSchema, TTag>;
    h(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    h_full(): PoseElement<TProps, TSchema, TTag>;
    h_screen(): PoseElement<TProps, TSchema, TTag>;
    h_min(): PoseElement<TProps, TSchema, TTag>;
    h_max(): PoseElement<TProps, TSchema, TTag>;
    h_fit(): PoseElement<TProps, TSchema, TTag>;
    min_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    max_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    min_h(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    max_h(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    aspect(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    aspect_auto(): PoseElement<TProps, TSchema, TTag>;
    aspect_square(): PoseElement<TProps, TSchema, TTag>;
    aspect_video(): PoseElement<TProps, TSchema, TTag>;

    // ── Position ─────────────────────────────────────────────────────────────
    static_pos(): PoseElement<TProps, TSchema, TTag>;
    relative(): PoseElement<TProps, TSchema, TTag>;
    absolute(): PoseElement<TProps, TSchema, TTag>;
    fixed(): PoseElement<TProps, TSchema, TTag>;
    sticky(): PoseElement<TProps, TSchema, TTag>;
    inset(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    inset_0(): PoseElement<TProps, TSchema, TTag>;
    inset_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    inset_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    top(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    right(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    bottom(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    left(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    z(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;

    // ── Visibility ───────────────────────────────────────────────────────────
    visible(): PoseElement<TProps, TSchema, TTag>;
    invisible(): PoseElement<TProps, TSchema, TTag>;

    // ── Float & Clear ────────────────────────────────────────────────────────
    float_left(): PoseElement<TProps, TSchema, TTag>;
    float_right(): PoseElement<TProps, TSchema, TTag>;
    float_none(): PoseElement<TProps, TSchema, TTag>;
    clear_left(): PoseElement<TProps, TSchema, TTag>;
    clear_right(): PoseElement<TProps, TSchema, TTag>;
    clear_both(): PoseElement<TProps, TSchema, TTag>;
    clear_none(): PoseElement<TProps, TSchema, TTag>;

    // ── Box Sizing ───────────────────────────────────────────────────────────
    box_border(): PoseElement<TProps, TSchema, TTag>;
    box_content(): PoseElement<TProps, TSchema, TTag>;

    // ── Overflow ─────────────────────────────────────────────────────────────
    overflow_auto(): PoseElement<TProps, TSchema, TTag>;
    overflow_hidden(): PoseElement<TProps, TSchema, TTag>;
    overflow_clip(): PoseElement<TProps, TSchema, TTag>;
    overflow_visible(): PoseElement<TProps, TSchema, TTag>;
    overflow_scroll(): PoseElement<TProps, TSchema, TTag>;
    overflow_x_auto(): PoseElement<TProps, TSchema, TTag>;
    overflow_x_hidden(): PoseElement<TProps, TSchema, TTag>;
    overflow_x_clip(): PoseElement<TProps, TSchema, TTag>;
    overflow_x_visible(): PoseElement<TProps, TSchema, TTag>;
    overflow_x_scroll(): PoseElement<TProps, TSchema, TTag>;
    overflow_y_auto(): PoseElement<TProps, TSchema, TTag>;
    overflow_y_hidden(): PoseElement<TProps, TSchema, TTag>;
    overflow_y_clip(): PoseElement<TProps, TSchema, TTag>;
    overflow_y_visible(): PoseElement<TProps, TSchema, TTag>;
    overflow_y_scroll(): PoseElement<TProps, TSchema, TTag>;

    // ── Colours ──────────────────────────────────────────────────────────────
    bg(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    bg_opacity(value: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    text_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    opacity(value: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;

    // ── Background ───────────────────────────────────────────────────────────
    bg_clip(
      value: Dyn<TProps, "border" | "padding" | "content" | "text">,
    ): PoseElement<TProps, TSchema, TTag>;
    bg_size(value: Dyn<TProps, "auto" | "cover" | "contain">): PoseElement<TProps, TSchema, TTag>;
    bg_position(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    bg_repeat(
      value?: Dyn<TProps, "x" | "y" | "round" | "space" | "none">,
    ): PoseElement<TProps, TSchema, TTag>;
    bg_attachment(
      value: Dyn<TProps, "fixed" | "local" | "scroll">,
    ): PoseElement<TProps, TSchema, TTag>;
    bg_gradient(
      dir: Dyn<TProps, "t" | "tr" | "r" | "br" | "b" | "bl" | "l" | "tl">,
    ): PoseElement<TProps, TSchema, TTag>;
    from(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    via(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    to(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Border ───────────────────────────────────────────────────────────────
    border(): PoseElement<TProps, TSchema, TTag>;
    border_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_t(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_r(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_b(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_l(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_x(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_y(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    border_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    border_solid(): PoseElement<TProps, TSchema, TTag>;
    border_dashed(): PoseElement<TProps, TSchema, TTag>;
    border_dotted(): PoseElement<TProps, TSchema, TTag>;
    border_double(): PoseElement<TProps, TSchema, TTag>;
    border_none(): PoseElement<TProps, TSchema, TTag>;
    border_collapse(): PoseElement<TProps, TSchema, TTag>;
    border_separate(): PoseElement<TProps, TSchema, TTag>;
    rounded(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    rounded_full(): PoseElement<TProps, TSchema, TTag>;
    rounded_t(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    rounded_r(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    rounded_b(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    rounded_l(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Divide ───────────────────────────────────────────────────────────────
    divide_x(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    divide_y(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    divide_x_reverse(): PoseElement<TProps, TSchema, TTag>;
    divide_y_reverse(): PoseElement<TProps, TSchema, TTag>;
    divide_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    divide_solid(): PoseElement<TProps, TSchema, TTag>;
    divide_dashed(): PoseElement<TProps, TSchema, TTag>;
    divide_dotted(): PoseElement<TProps, TSchema, TTag>;
    divide_none(): PoseElement<TProps, TSchema, TTag>;

    // ── Ring ─────────────────────────────────────────────────────────────────
    ring(): PoseElement<TProps, TSchema, TTag>;
    ring_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    ring_inset(): PoseElement<TProps, TSchema, TTag>;
    ring_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    ring_offset(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    ring_offset_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Outline ──────────────────────────────────────────────────────────────
    outline_none(): PoseElement<TProps, TSchema, TTag>;
    outline(): PoseElement<TProps, TSchema, TTag>;
    outline_dashed(): PoseElement<TProps, TSchema, TTag>;
    outline_dotted(): PoseElement<TProps, TSchema, TTag>;
    outline_double(): PoseElement<TProps, TSchema, TTag>;
    outline_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    outline_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    outline_offset(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;

    // ── Shadow ───────────────────────────────────────────────────────────────
    shadow(): PoseElement<TProps, TSchema, TTag>;
    shadow_sm(): PoseElement<TProps, TSchema, TTag>;
    shadow_md(): PoseElement<TProps, TSchema, TTag>;
    shadow_lg(): PoseElement<TProps, TSchema, TTag>;
    shadow_xl(): PoseElement<TProps, TSchema, TTag>;
    shadow_2xl(): PoseElement<TProps, TSchema, TTag>;
    shadow_inner(): PoseElement<TProps, TSchema, TTag>;
    shadow_none(): PoseElement<TProps, TSchema, TTag>;
    shadow_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Typography ───────────────────────────────────────────────────────────
    text(size: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    text_xs(): PoseElement<TProps, TSchema, TTag>;
    text_sm(): PoseElement<TProps, TSchema, TTag>;
    text_base(): PoseElement<TProps, TSchema, TTag>;
    text_lg(): PoseElement<TProps, TSchema, TTag>;
    text_xl(): PoseElement<TProps, TSchema, TTag>;
    text_2xl(): PoseElement<TProps, TSchema, TTag>;
    text_3xl(): PoseElement<TProps, TSchema, TTag>;
    text_4xl(): PoseElement<TProps, TSchema, TTag>;
    text_5xl(): PoseElement<TProps, TSchema, TTag>;
    text_6xl(): PoseElement<TProps, TSchema, TTag>;
    text_7xl(): PoseElement<TProps, TSchema, TTag>;
    text_8xl(): PoseElement<TProps, TSchema, TTag>;
    text_9xl(): PoseElement<TProps, TSchema, TTag>;
    font_thin(): PoseElement<TProps, TSchema, TTag>;
    font_extralight(): PoseElement<TProps, TSchema, TTag>;
    font_light(): PoseElement<TProps, TSchema, TTag>;
    font_normal(): PoseElement<TProps, TSchema, TTag>;
    font_medium(): PoseElement<TProps, TSchema, TTag>;
    font_semibold(): PoseElement<TProps, TSchema, TTag>;
    font_bold(): PoseElement<TProps, TSchema, TTag>;
    font_extrabold(): PoseElement<TProps, TSchema, TTag>;
    font_black(): PoseElement<TProps, TSchema, TTag>;
    italic(): PoseElement<TProps, TSchema, TTag>;
    not_italic(): PoseElement<TProps, TSchema, TTag>;
    text_left(): PoseElement<TProps, TSchema, TTag>;
    text_center(): PoseElement<TProps, TSchema, TTag>;
    text_right(): PoseElement<TProps, TSchema, TTag>;
    text_justify(): PoseElement<TProps, TSchema, TTag>;
    text_wrap(): PoseElement<TProps, TSchema, TTag>;
    text_nowrap(): PoseElement<TProps, TSchema, TTag>;
    text_balance(): PoseElement<TProps, TSchema, TTag>;
    text_pretty(): PoseElement<TProps, TSchema, TTag>;
    truncate(): PoseElement<TProps, TSchema, TTag>;
    text_ellipsis(): PoseElement<TProps, TSchema, TTag>;
    text_clip(): PoseElement<TProps, TSchema, TTag>;
    leading(value: Dyn<TProps, string | number>): PoseElement<TProps, TSchema, TTag>;
    tracking(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    line_clamp(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    whitespace(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    break_normal(): PoseElement<TProps, TSchema, TTag>;
    break_words(): PoseElement<TProps, TSchema, TTag>;
    break_all(): PoseElement<TProps, TSchema, TTag>;
    break_keep(): PoseElement<TProps, TSchema, TTag>;
    uppercase(): PoseElement<TProps, TSchema, TTag>;
    lowercase(): PoseElement<TProps, TSchema, TTag>;
    capitalize(): PoseElement<TProps, TSchema, TTag>;
    normal_case(): PoseElement<TProps, TSchema, TTag>;
    underline(): PoseElement<TProps, TSchema, TTag>;
    overline(): PoseElement<TProps, TSchema, TTag>;
    line_through(): PoseElement<TProps, TSchema, TTag>;
    no_underline(): PoseElement<TProps, TSchema, TTag>;
    decoration_color(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    indent(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    align(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    font_family(family: Dyn<TProps, "sans" | "serif" | "mono">): PoseElement<TProps, TSchema, TTag>;

    // ── List ─────────────────────────────────────────────────────────────────
    list_none(): PoseElement<TProps, TSchema, TTag>;
    list_disc(): PoseElement<TProps, TSchema, TTag>;
    list_decimal(): PoseElement<TProps, TSchema, TTag>;
    list_inside(): PoseElement<TProps, TSchema, TTag>;
    list_outside(): PoseElement<TProps, TSchema, TTag>;

    // ── Object fit / position ────────────────────────────────────────────────
    object_contain(): PoseElement<TProps, TSchema, TTag>;
    object_cover(): PoseElement<TProps, TSchema, TTag>;
    object_fill(): PoseElement<TProps, TSchema, TTag>;
    object_none(): PoseElement<TProps, TSchema, TTag>;
    object_scale_down(): PoseElement<TProps, TSchema, TTag>;
    object_position(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Transforms ───────────────────────────────────────────────────────────
    scale(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    scale_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    scale_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    rotate(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    translate_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    translate_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    skew_x(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    skew_y(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    origin(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Filters ──────────────────────────────────────────────────────────────
    blur(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    brightness(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    contrast(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    grayscale(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    hue_rotate(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    invert(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    saturate(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    sepia(n?: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    drop_shadow(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    backdrop_blur(size?: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    backdrop_brightness(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;

    // ── Animation ────────────────────────────────────────────────────────────
    animate_none(): PoseElement<TProps, TSchema, TTag>;
    animate_spin(): PoseElement<TProps, TSchema, TTag>;
    animate_ping(): PoseElement<TProps, TSchema, TTag>;
    animate_pulse(): PoseElement<TProps, TSchema, TTag>;
    animate_bounce(): PoseElement<TProps, TSchema, TTag>;
    transition(): PoseElement<TProps, TSchema, TTag>;
    transition_prop(prop: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    duration(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    delay(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;
    ease(
      value: Dyn<TProps, "linear" | "in" | "out" | "in-out">,
    ): PoseElement<TProps, TSchema, TTag>;
    will_change(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── Interactivity ────────────────────────────────────────────────────────
    cursor_auto(): PoseElement<TProps, TSchema, TTag>;
    cursor_default(): PoseElement<TProps, TSchema, TTag>;
    cursor_pointer(): PoseElement<TProps, TSchema, TTag>;
    cursor_wait(): PoseElement<TProps, TSchema, TTag>;
    cursor_text(): PoseElement<TProps, TSchema, TTag>;
    cursor_move(): PoseElement<TProps, TSchema, TTag>;
    cursor_not_allowed(): PoseElement<TProps, TSchema, TTag>;
    cursor_grab(): PoseElement<TProps, TSchema, TTag>;
    cursor_grabbing(): PoseElement<TProps, TSchema, TTag>;
    cursor_crosshair(): PoseElement<TProps, TSchema, TTag>;
    select_none(): PoseElement<TProps, TSchema, TTag>;
    select_text(): PoseElement<TProps, TSchema, TTag>;
    select_all(): PoseElement<TProps, TSchema, TTag>;
    select_auto(): PoseElement<TProps, TSchema, TTag>;
    resize_none(): PoseElement<TProps, TSchema, TTag>;
    resize(): PoseElement<TProps, TSchema, TTag>;
    resize_x(): PoseElement<TProps, TSchema, TTag>;
    resize_y(): PoseElement<TProps, TSchema, TTag>;
    pointer_events_none(): PoseElement<TProps, TSchema, TTag>;
    pointer_events_auto(): PoseElement<TProps, TSchema, TTag>;
    touch_auto(): PoseElement<TProps, TSchema, TTag>;
    touch_none(): PoseElement<TProps, TSchema, TTag>;
    touch_pan_x(): PoseElement<TProps, TSchema, TTag>;
    touch_pan_y(): PoseElement<TProps, TSchema, TTag>;
    touch_manipulation(): PoseElement<TProps, TSchema, TTag>;
    appearance_none(): PoseElement<TProps, TSchema, TTag>;

    // ── Mix blend ────────────────────────────────────────────────────────────
    mix_blend(mode: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

    // ── SVG ──────────────────────────────────────────────────────────────────
    fill(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    stroke(color: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;
    stroke_w(n: Dyn<TProps, number | string>): PoseElement<TProps, TSchema, TTag>;

    // ── Accessibility ────────────────────────────────────────────────────────
    sr_only(): PoseElement<TProps, TSchema, TTag>;
    not_sr_only(): PoseElement<TProps, TSchema, TTag>;
  }
}

// ---------------------------------------------------------------------------
// Preset implementation
// ---------------------------------------------------------------------------

export const tailwind4: Preset<PoseElement<any, any>> = {
  name: "tailwind4",

  extend(el, { cls, dynCls }) {
    // Display
    el.block = () => cls("block");
    el.inline = () => cls("inline");
    el.inline_block = () => cls("inline-block");
    el.flex = () => cls("flex");
    el.inline_flex = () => cls("inline-flex");
    el.grid = () => cls("grid");
    el.inline_grid = () => cls("inline-grid");
    el.flow_root = () => cls("flow-root");
    el.hidden = () => cls("hidden");
    el.contents = () => cls("contents");
    el.table = () => cls("table");
    el.table_caption = () => cls("table-caption");
    el.table_cell = () => cls("table-cell");
    el.table_column = () => cls("table-column");
    el.table_column_group = () => cls("table-column-group");
    el.table_footer_group = () => cls("table-footer-group");
    el.table_header_group = () => cls("table-header-group");
    el.table_row_group = () => cls("table-row-group");
    el.table_row = () => cls("table-row");

    // Flexbox
    el.flex_row = () => cls("flex-row");
    el.flex_row_reverse = () => cls("flex-row-reverse");
    el.flex_col = () => cls("flex-col");
    el.flex_col_reverse = () => cls("flex-col-reverse");
    el.flex_wrap = () => cls("flex-wrap");
    el.flex_wrap_reverse = () => cls("flex-wrap-reverse");
    el.flex_nowrap = () => cls("flex-nowrap");
    el.flex_1 = () => cls("flex-1");
    el.flex_auto = () => cls("flex-auto");
    el.flex_initial = () => cls("flex-initial");
    el.flex_none = () => cls("flex-none");
    el.grow = () => cls("grow");
    el.grow_0 = () => cls("grow-0");
    el.shrink = () => cls("shrink");
    el.shrink_0 = () => cls("shrink-0");
    el.order = (n) => dynCls(n, (v) => tw("order", v));
    el.order_first = () => cls("order-first");
    el.order_last = () => cls("order-last");
    el.order_none = () => cls("order-none");

    // Grid
    el.grid_cols = (n) => dynCls(n, (v) => tw("grid-cols", v));
    el.grid_rows = (n) => dynCls(n, (v) => tw("grid-rows", v));
    el.col_span = (n) => dynCls(n, (v) => tw("col-span", v));
    el.col_start = (n) => dynCls(n, (v) => tw("col-start", v));
    el.col_end = (n) => dynCls(n, (v) => tw("col-end", v));
    el.row_span = (n) => dynCls(n, (v) => tw("row-span", v));
    el.row_start = (n) => dynCls(n, (v) => tw("row-start", v));
    el.row_end = (n) => dynCls(n, (v) => tw("row-end", v));
    el.grid_flow_row = () => cls("grid-flow-row");
    el.grid_flow_col = () => cls("grid-flow-col");
    el.grid_flow_dense = () => cls("grid-flow-dense");
    el.auto_cols = (v) => dynCls(v, (s) => tw("auto-cols", s));
    el.auto_rows = (v) => dynCls(v, (s) => tw("auto-rows", s));

    // Alignment
    el.justify_start = () => cls("justify-start");
    el.justify_end = () => cls("justify-end");
    el.justify_center = () => cls("justify-center");
    el.justify_between = () => cls("justify-between");
    el.justify_around = () => cls("justify-around");
    el.justify_evenly = () => cls("justify-evenly");
    el.justify_items_start = () => cls("justify-items-start");
    el.justify_items_end = () => cls("justify-items-end");
    el.justify_items_center = () => cls("justify-items-center");
    el.justify_items_stretch = () => cls("justify-items-stretch");
    el.justify_self_auto = () => cls("justify-self-auto");
    el.justify_self_start = () => cls("justify-self-start");
    el.justify_self_end = () => cls("justify-self-end");
    el.justify_self_center = () => cls("justify-self-center");
    el.justify_self_stretch = () => cls("justify-self-stretch");
    el.items_start = () => cls("items-start");
    el.items_end = () => cls("items-end");
    el.items_center = () => cls("items-center");
    el.items_stretch = () => cls("items-stretch");
    el.items_baseline = () => cls("items-baseline");
    el.self_auto = () => cls("self-auto");
    el.self_start = () => cls("self-start");
    el.self_end = () => cls("self-end");
    el.self_center = () => cls("self-center");
    el.self_stretch = () => cls("self-stretch");
    el.self_baseline = () => cls("self-baseline");
    el.content_start = () => cls("content-start");
    el.content_end = () => cls("content-end");
    el.content_center = () => cls("content-center");
    el.content_between = () => cls("content-between");
    el.content_around = () => cls("content-around");
    el.content_evenly = () => cls("content-evenly");
    el.place_content = (v) => dynCls(v, (s) => tw("place-content", s));
    el.place_items = (v) => dynCls(v, (s) => tw("place-items", s));
    el.place_self = (v) => dynCls(v, (s) => tw("place-self", s));

    // Spacing
    el.gap = (n) => dynCls(n, (v) => tw("gap", v));
    el.gap_0 = () => cls("gap-0");
    el.gap_1 = () => cls("gap-1");
    el.gap_2 = () => cls("gap-2");
    el.gap_3 = () => cls("gap-3");
    el.gap_4 = () => cls("gap-4");
    el.gap_5 = () => cls("gap-5");
    el.gap_6 = () => cls("gap-6");
    el.gap_7 = () => cls("gap-7");
    el.gap_8 = () => cls("gap-8");
    el.gap_x = (n) => dynCls(n, (v) => tw("gap-x", v));
    el.gap_y = (n) => dynCls(n, (v) => tw("gap-y", v));
    el.space_x = (n) => dynCls(n, (v) => tw("space-x", v));
    el.space_y = (n) => dynCls(n, (v) => tw("space-y", v));
    el.space_x_reverse = () => cls("space-x-reverse");
    el.space_y_reverse = () => cls("space-y-reverse");
    el.p = (n) => dynCls(n, (v) => tw("p", v));
    el.px = (n) => dynCls(n, (v) => tw("px", v));
    el.py = (n) => dynCls(n, (v) => tw("py", v));
    el.pt = (n) => dynCls(n, (v) => tw("pt", v));
    el.pr = (n) => dynCls(n, (v) => tw("pr", v));
    el.pb = (n) => dynCls(n, (v) => tw("pb", v));
    el.pl = (n) => dynCls(n, (v) => tw("pl", v));
    el.m = (n) => dynCls(n, (v) => tw("m", v));
    el.mx = (n) => dynCls(n, (v) => tw("mx", v));
    el.my = (n) => dynCls(n, (v) => tw("my", v));
    el.mt = (n) => dynCls(n, (v) => tw("mt", v));
    el.mr = (n) => dynCls(n, (v) => tw("mr", v));
    el.mb = (n) => dynCls(n, (v) => tw("mb", v));
    el.ml = (n) => dynCls(n, (v) => tw("ml", v));
    el.m_auto = () => cls("m-auto");
    el.mx_auto = () => cls("mx-auto");
    el.my_auto = () => cls("my-auto");

    // Sizing
    el.size = (n) => dynCls(n, (v) => tw("size", v));
    el.w = (n) => dynCls(n, (v) => tw("w", v));
    el.w_full = () => cls("w-full");
    el.w_screen = () => cls("w-screen");
    el.w_min = () => cls("w-min");
    el.w_max = () => cls("w-max");
    el.w_fit = () => cls("w-fit");
    el.h = (n) => dynCls(n, (v) => tw("h", v));
    el.h_full = () => cls("h-full");
    el.h_screen = () => cls("h-screen");
    el.h_min = () => cls("h-min");
    el.h_max = () => cls("h-max");
    el.h_fit = () => cls("h-fit");
    el.min_w = (n) => dynCls(n, (v) => tw("min-w", v));
    el.max_w = (n) => dynCls(n, (v) => tw("max-w", v));
    el.min_h = (n) => dynCls(n, (v) => tw("min-h", v));
    el.max_h = (n) => dynCls(n, (v) => tw("max-h", v));
    el.aspect = (v) => dynCls(v, (s) => tw("aspect", s));
    el.aspect_auto = () => cls("aspect-auto");
    el.aspect_square = () => cls("aspect-square");
    el.aspect_video = () => cls("aspect-video");

    // Position
    el.static_pos = () => cls("static");
    el.relative = () => cls("relative");
    el.absolute = () => cls("absolute");
    el.fixed = () => cls("fixed");
    el.sticky = () => cls("sticky");
    el.inset = (n) => dynCls(n, (v) => tw("inset", v));
    el.inset_0 = () => cls("inset-0");
    el.inset_x = (n) => dynCls(n, (v) => tw("inset-x", v));
    el.inset_y = (n) => dynCls(n, (v) => tw("inset-y", v));
    el.top = (n) => dynCls(n, (v) => tw("top", v));
    el.right = (n) => dynCls(n, (v) => tw("right", v));
    el.bottom = (n) => dynCls(n, (v) => tw("bottom", v));
    el.left = (n) => dynCls(n, (v) => tw("left", v));
    el.z = (n) => dynCls(n, (v) => tw("z", v));

    // Visibility
    el.visible = () => cls("visible");
    el.invisible = () => cls("invisible");

    // Float & clear
    el.float_left = () => cls("float-left");
    el.float_right = () => cls("float-right");
    el.float_none = () => cls("float-none");
    el.clear_left = () => cls("clear-left");
    el.clear_right = () => cls("clear-right");
    el.clear_both = () => cls("clear-both");
    el.clear_none = () => cls("clear-none");

    // Box sizing
    el.box_border = () => cls("box-border");
    el.box_content = () => cls("box-content");

    // Overflow
    el.overflow_auto = () => cls("overflow-auto");
    el.overflow_hidden = () => cls("overflow-hidden");
    el.overflow_clip = () => cls("overflow-clip");
    el.overflow_visible = () => cls("overflow-visible");
    el.overflow_scroll = () => cls("overflow-scroll");
    el.overflow_x_auto = () => cls("overflow-x-auto");
    el.overflow_x_hidden = () => cls("overflow-x-hidden");
    el.overflow_x_clip = () => cls("overflow-x-clip");
    el.overflow_x_visible = () => cls("overflow-x-visible");
    el.overflow_x_scroll = () => cls("overflow-x-scroll");
    el.overflow_y_auto = () => cls("overflow-y-auto");
    el.overflow_y_hidden = () => cls("overflow-y-hidden");
    el.overflow_y_clip = () => cls("overflow-y-clip");
    el.overflow_y_visible = () => cls("overflow-y-visible");
    el.overflow_y_scroll = () => cls("overflow-y-scroll");

    // Colours
    el.bg = (c) => dynCls(c, (v) => `bg-${arbitrary(v)}`);
    el.bg_opacity = (v) => dynCls(v, (n) => tw("bg-opacity", n));
    el.text_color = (c) => dynCls(c, (v) => `text-${arbitrary(v)}`);
    el.opacity = (v) => dynCls(v, (n) => tw("opacity", n));

    // Background
    el.bg_clip = (v) => dynCls(v, (s) => `bg-clip-${s}`);
    el.bg_size = (v) => dynCls(v, (s) => `bg-${s}`);
    el.bg_position = (v) => dynCls(v, (s) => `bg-${s}`);
    el.bg_repeat = (v) =>
      v !== undefined
        ? dynCls(v, (s) => (s === "none" ? "bg-no-repeat" : `bg-repeat-${s}`))
        : cls("bg-repeat");
    el.bg_attachment = (v) => dynCls(v, (s) => `bg-${s}`);
    el.bg_gradient = (dir) => dynCls(dir, (d) => `bg-gradient-to-${d}`);
    el.from = (c) => dynCls(c, (v) => `from-${arbitrary(v)}`);
    el.via = (c) => dynCls(c, (v) => `via-${arbitrary(v)}`);
    el.to = (c) => dynCls(c, (v) => `to-${arbitrary(v)}`);

    // Border
    el.border = () => cls("border");
    el.border_w = (n) => dynCls(n, (v) => tw("border", v));
    el.border_t = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-t", v)) : cls("border-t"));
    el.border_r = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-r", v)) : cls("border-r"));
    el.border_b = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-b", v)) : cls("border-b"));
    el.border_l = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-l", v)) : cls("border-l"));
    el.border_x = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-x", v)) : cls("border-x"));
    el.border_y = (n) => (n !== undefined ? dynCls(n, (v) => tw("border-y", v)) : cls("border-y"));
    el.border_color = (c) => dynCls(c, (v) => `border-${arbitrary(v)}`);
    el.border_solid = () => cls("border-solid");
    el.border_dashed = () => cls("border-dashed");
    el.border_dotted = () => cls("border-dotted");
    el.border_double = () => cls("border-double");
    el.border_none = () => cls("border-none");
    el.border_collapse = () => cls("border-collapse");
    el.border_separate = () => cls("border-separate");
    el.rounded = (s) => (s !== undefined ? dynCls(s, (v) => `rounded-${v}`) : cls("rounded"));
    el.rounded_full = () => cls("rounded-full");
    el.rounded_t = (s) => (s !== undefined ? dynCls(s, (v) => `rounded-t-${v}`) : cls("rounded-t"));
    el.rounded_r = (s) => (s !== undefined ? dynCls(s, (v) => `rounded-r-${v}`) : cls("rounded-r"));
    el.rounded_b = (s) => (s !== undefined ? dynCls(s, (v) => `rounded-b-${v}`) : cls("rounded-b"));
    el.rounded_l = (s) => (s !== undefined ? dynCls(s, (v) => `rounded-l-${v}`) : cls("rounded-l"));

    // Divide
    el.divide_x = (n) => (n !== undefined ? dynCls(n, (v) => tw("divide-x", v)) : cls("divide-x"));
    el.divide_y = (n) => (n !== undefined ? dynCls(n, (v) => tw("divide-y", v)) : cls("divide-y"));
    el.divide_x_reverse = () => cls("divide-x-reverse");
    el.divide_y_reverse = () => cls("divide-y-reverse");
    el.divide_color = (c) => dynCls(c, (v) => `divide-${arbitrary(v)}`);
    el.divide_solid = () => cls("divide-solid");
    el.divide_dashed = () => cls("divide-dashed");
    el.divide_dotted = () => cls("divide-dotted");
    el.divide_none = () => cls("divide-none");

    // Ring
    el.ring = () => cls("ring");
    el.ring_w = (n) => dynCls(n, (v) => tw("ring", v));
    el.ring_inset = () => cls("ring-inset");
    el.ring_color = (c) => dynCls(c, (v) => `ring-${arbitrary(v)}`);
    el.ring_offset = (n) => dynCls(n, (v) => tw("ring-offset", v));
    el.ring_offset_color = (c) => dynCls(c, (v) => `ring-offset-${arbitrary(v)}`);

    // Outline
    el.outline_none = () => cls("outline-none");
    el.outline = () => cls("outline");
    el.outline_dashed = () => cls("outline-dashed");
    el.outline_dotted = () => cls("outline-dotted");
    el.outline_double = () => cls("outline-double");
    el.outline_color = (c) => dynCls(c, (v) => `outline-${arbitrary(v)}`);
    el.outline_w = (n) => dynCls(n, (v) => tw("outline", v));
    el.outline_offset = (n) => dynCls(n, (v) => tw("outline-offset", v));

    // Shadow
    el.shadow = () => cls("shadow");
    el.shadow_sm = () => cls("shadow-sm");
    el.shadow_md = () => cls("shadow-md");
    el.shadow_lg = () => cls("shadow-lg");
    el.shadow_xl = () => cls("shadow-xl");
    el.shadow_2xl = () => cls("shadow-2xl");
    el.shadow_inner = () => cls("shadow-inner");
    el.shadow_none = () => cls("shadow-none");
    el.shadow_color = (c) => dynCls(c, (v) => `shadow-${arbitrary(v)}`);

    // Typography
    el.text = (s) => dynCls(s, (v) => `text-${v}`);
    el.text_xs = () => cls("text-xs");
    el.text_sm = () => cls("text-sm");
    el.text_base = () => cls("text-base");
    el.text_lg = () => cls("text-lg");
    el.text_xl = () => cls("text-xl");
    el.text_2xl = () => cls("text-2xl");
    el.text_3xl = () => cls("text-3xl");
    el.text_4xl = () => cls("text-4xl");
    el.text_5xl = () => cls("text-5xl");
    el.text_6xl = () => cls("text-6xl");
    el.text_7xl = () => cls("text-7xl");
    el.text_8xl = () => cls("text-8xl");
    el.text_9xl = () => cls("text-9xl");
    el.font_thin = () => cls("font-thin");
    el.font_extralight = () => cls("font-extralight");
    el.font_light = () => cls("font-light");
    el.font_normal = () => cls("font-normal");
    el.font_medium = () => cls("font-medium");
    el.font_semibold = () => cls("font-semibold");
    el.font_bold = () => cls("font-bold");
    el.font_extrabold = () => cls("font-extrabold");
    el.font_black = () => cls("font-black");
    el.italic = () => cls("italic");
    el.not_italic = () => cls("not-italic");
    el.text_left = () => cls("text-left");
    el.text_center = () => cls("text-center");
    el.text_right = () => cls("text-right");
    el.text_justify = () => cls("text-justify");
    el.text_wrap = () => cls("text-wrap");
    el.text_nowrap = () => cls("text-nowrap");
    el.text_balance = () => cls("text-balance");
    el.text_pretty = () => cls("text-pretty");
    el.truncate = () => cls("truncate");
    el.text_ellipsis = () => cls("text-ellipsis");
    el.text_clip = () => cls("text-clip");
    el.leading = (v) => dynCls(v, (n) => tw("leading", n));
    el.tracking = (v) => dynCls(v, (n) => tw("tracking", n));
    el.line_clamp = (n) => dynCls(n, (v) => tw("line-clamp", v));
    el.whitespace = (v) => dynCls(v, (s) => tw("whitespace", s));
    el.break_normal = () => cls("break-normal");
    el.break_words = () => cls("break-words");
    el.break_all = () => cls("break-all");
    el.break_keep = () => cls("break-keep");
    el.uppercase = () => cls("uppercase");
    el.lowercase = () => cls("lowercase");
    el.capitalize = () => cls("capitalize");
    el.normal_case = () => cls("normal-case");
    el.underline = () => cls("underline");
    el.overline = () => cls("overline");
    el.line_through = () => cls("line-through");
    el.no_underline = () => cls("no-underline");
    el.decoration_color = (c) => dynCls(c, (v) => `decoration-${arbitrary(v)}`);
    el.indent = (n) => dynCls(n, (v) => tw("indent", v));
    el.align = (v) => dynCls(v, (s) => tw("align", s));
    el.font_family = (v) => dynCls(v, (s) => tw("font", s));

    // List
    el.list_none = () => cls("list-none");
    el.list_disc = () => cls("list-disc");
    el.list_decimal = () => cls("list-decimal");
    el.list_inside = () => cls("list-inside");
    el.list_outside = () => cls("list-outside");

    // Object fit/position
    el.object_contain = () => cls("object-contain");
    el.object_cover = () => cls("object-cover");
    el.object_fill = () => cls("object-fill");
    el.object_none = () => cls("object-none");
    el.object_scale_down = () => cls("object-scale-down");
    el.object_position = (v) => dynCls(v, (s) => `object-${s}`);

    // Transforms
    el.scale = (n) => dynCls(n, (v) => tw("scale", v));
    el.scale_x = (n) => dynCls(n, (v) => tw("scale-x", v));
    el.scale_y = (n) => dynCls(n, (v) => tw("scale-y", v));
    el.rotate = (n) => dynCls(n, (v) => tw("rotate", v));
    el.translate_x = (n) => dynCls(n, (v) => tw("translate-x", v));
    el.translate_y = (n) => dynCls(n, (v) => tw("translate-y", v));
    el.skew_x = (n) => dynCls(n, (v) => tw("skew-x", v));
    el.skew_y = (n) => dynCls(n, (v) => tw("skew-y", v));
    el.origin = (v) => dynCls(v, (s) => tw("origin", s));

    // Filters
    el.blur = (s) => (s !== undefined ? dynCls(s, (v) => tw("blur", v)) : cls("blur"));
    el.brightness = (n) => dynCls(n, (v) => tw("brightness", v));
    el.contrast = (n) => dynCls(n, (v) => tw("contrast", v));
    el.grayscale = (n) =>
      n !== undefined ? dynCls(n, (v) => tw("grayscale", v)) : cls("grayscale");
    el.hue_rotate = (n) => dynCls(n, (v) => tw("hue-rotate", v));
    el.invert = (n) => (n !== undefined ? dynCls(n, (v) => tw("invert", v)) : cls("invert"));
    el.saturate = (n) => dynCls(n, (v) => tw("saturate", v));
    el.sepia = (n) => (n !== undefined ? dynCls(n, (v) => tw("sepia", v)) : cls("sepia"));
    el.drop_shadow = (s) =>
      s !== undefined ? dynCls(s, (v) => tw("drop-shadow", v)) : cls("drop-shadow");
    el.backdrop_blur = (s) =>
      s !== undefined ? dynCls(s, (v) => tw("backdrop-blur", v)) : cls("backdrop-blur");
    el.backdrop_brightness = (n) => dynCls(n, (v) => tw("backdrop-brightness", v));

    // Animation
    el.animate_none = () => cls("animate-none");
    el.animate_spin = () => cls("animate-spin");
    el.animate_ping = () => cls("animate-ping");
    el.animate_pulse = () => cls("animate-pulse");
    el.animate_bounce = () => cls("animate-bounce");
    el.transition = () => cls("transition");
    el.transition_prop = (p) => dynCls(p, (v) => `transition-${v}`);
    el.duration = (n) => dynCls(n, (v) => tw("duration", v));
    el.delay = (n) => dynCls(n, (v) => tw("delay", v));
    el.ease = (v) => dynCls(v, (s) => tw("ease", s));
    el.will_change = (v) => dynCls(v, (s) => tw("will-change", s));

    // Interactivity
    el.cursor_auto = () => cls("cursor-auto");
    el.cursor_default = () => cls("cursor-default");
    el.cursor_pointer = () => cls("cursor-pointer");
    el.cursor_wait = () => cls("cursor-wait");
    el.cursor_text = () => cls("cursor-text");
    el.cursor_move = () => cls("cursor-move");
    el.cursor_not_allowed = () => cls("cursor-not-allowed");
    el.cursor_grab = () => cls("cursor-grab");
    el.cursor_grabbing = () => cls("cursor-grabbing");
    el.cursor_crosshair = () => cls("cursor-crosshair");
    el.select_none = () => cls("select-none");
    el.select_text = () => cls("select-text");
    el.select_all = () => cls("select-all");
    el.select_auto = () => cls("select-auto");
    el.resize_none = () => cls("resize-none");
    el.resize = () => cls("resize");
    el.resize_x = () => cls("resize-x");
    el.resize_y = () => cls("resize-y");
    el.pointer_events_none = () => cls("pointer-events-none");
    el.pointer_events_auto = () => cls("pointer-events-auto");
    el.touch_auto = () => cls("touch-auto");
    el.touch_none = () => cls("touch-none");
    el.touch_pan_x = () => cls("touch-pan-x");
    el.touch_pan_y = () => cls("touch-pan-y");
    el.touch_manipulation = () => cls("touch-manipulation");
    el.appearance_none = () => cls("appearance-none");

    // Mix blend
    el.mix_blend = (mode) => dynCls(mode, (v) => tw("mix-blend", v));

    // SVG
    el.fill = (c) => dynCls(c, (v) => `fill-${arbitrary(v)}`);
    el.stroke = (c) => dynCls(c, (v) => `stroke-${arbitrary(v)}`);
    el.stroke_w = (n) => dynCls(n, (v) => tw("stroke", v));

    // Accessibility
    el.sr_only = () => cls("sr-only");
    el.not_sr_only = () => cls("not-sr-only");
  },
};
