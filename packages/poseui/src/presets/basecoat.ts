// =============================================================================
// basecoat.css preset for poseui
//
// A thin typed adapter over basecoat.css. Every method maps directly to
// basecoat class names — no styles are defined here, only the mapping.
//
// Setup:
//   /* app.css */
//   @import "tailwindcss";
//   @import "basecoat-css";
//
//   // main.ts
//   import { createPose }  from "poseui";
//   import { tailwind4 }   from "poseui/tailwind4";
//   import { basecoat }    from "@poseui/kit";
//
//   const pose = createPose({ presets: [tailwind4, basecoat] });
//
//   const button = pose.as("button").btn();
//   button({ variant: "secondary", size: "lg", child: "Save" });
//   // → <button class="btn-lg-secondary">Save</button>
// =============================================================================

import type { PoseElement, Preset } from "poseui";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — exported so callers can extend or compose them
// ---------------------------------------------------------------------------

export const BtnVariant = z.enum([
  "primary",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
]);
export const BtnSize = z.enum(["sm", "md", "lg", "icon"]);

export const BtnSchema = z.object({
  variant: BtnVariant.default("primary"),
  size: BtnSize.default("md"),
  disabled: z.boolean().default(false),
  pressed: z.boolean().default(false),
  child: z.string().default(""),
});
export type BtnProps = z.infer<typeof BtnSchema>;

export const BadgeSchema = z.object({
  variant: z.enum(["primary", "secondary", "destructive", "outline"]).default("primary"),
  child: z.string().default(""),
});
export type BadgeProps = z.infer<typeof BadgeSchema>;

export const AlertSchema = z.object({
  variant: z.enum(["default", "destructive"]).default("default"),
  title: z.string().optional(),
  child: z.string().default(""),
});
export type AlertProps = z.infer<typeof AlertSchema>;

export const CardSchema = z.object({
  title: z.string().optional(),
  desc: z.string().optional(),
  child: z.string().default(""),
  footer: z.string().optional(),
});
export type CardProps = z.infer<typeof CardSchema>;

export const InputSchema = z.object({
  type: z
    .enum([
      "text",
      "email",
      "password",
      "number",
      "tel",
      "url",
      "search",
      "date",
      "datetime-local",
      "month",
      "week",
      "time",
      "file",
    ])
    .default("text"),
  name: z.string().default(""),
  placeholder: z.string().default(""),
  value: z.string().default(""),
  disabled: z.boolean().default(false),
  readonly: z.boolean().default(false),
  required: z.boolean().default(false),
  invalid: z.boolean().default(false),
});
export type InputProps = z.infer<typeof InputSchema>;

export const TextareaSchema = z.object({
  name: z.string().default(""),
  placeholder: z.string().default(""),
  rows: z.number().default(3),
  disabled: z.boolean().default(false),
  readonly: z.boolean().default(false),
  required: z.boolean().default(false),
  invalid: z.boolean().default(false),
  child: z.string().default(""),
});
export type TextareaProps = z.infer<typeof TextareaSchema>;

export const LabelSchema = z.object({
  for: z.string().default(""),
  child: z.string().default(""),
});
export type LabelProps = z.infer<typeof LabelSchema>;

export const KbdSchema = z.object({
  child: z.string().default(""),
});
export type KbdProps = z.infer<typeof KbdSchema>;

export const TableSchema = z.object({
  caption: z.string().optional(),
  head: z.string().default(""), // raw <tr><th>…</th></tr> HTML
  body: z.string().default(""), // raw <tr><td>…</td></tr> HTML
  foot: z.string().optional(),
});
export type TableProps = z.infer<typeof TableSchema>;

export const TabsSchema = z.object({
  tabs: z.array(z.object({ id: z.string(), label: z.string(), content: z.string() })).default([]),
  active: z.string().default(""),
});
export type TabsProps = z.infer<typeof TabsSchema>;

export const TooltipSchema = z.object({
  tip: z.string().default(""),
  side: z.enum(["top", "bottom", "left", "right"]).default("top"),
  align: z.enum(["start", "center", "end"]).default("center"),
  child: z.string().default(""),
});
export type TooltipProps = z.infer<typeof TooltipSchema>;

// ---------------------------------------------------------------------------
// Declaration merging — augments PoseElement with basecoat component methods
// ---------------------------------------------------------------------------

declare module "poseui" {
  interface PoseElement<TProps extends Record<string, unknown>, TSchema, TTag extends string> {
    /**
     * Button — maps to basecoat `.btn*` classes.
     *
     * Class derivation matches basecoat exactly:
     *   md + primary  → "btn"
     *   sm + primary  → "btn-sm"
     *   lg + secondary→ "btn-lg-secondary"
     *   md + ghost    → "btn-ghost"
     *   icon + outline→ "btn-icon-outline"
     *
     * @example
     * const button = pose.as("button").btn();
     * button({ variant: "secondary", size: "lg", child: "Save" })
     * // → <button class="btn-lg-secondary">Save</button>
     *
     * button({ variant: "destructive", size: "icon", child: "✕" })
     * // → <button class="btn-icon-destructive">✕</button>
     */
    btn(): PoseElement<BtnProps, typeof BtnSchema, TTag>;

    /**
     * Badge — maps to basecoat `.badge*` classes.
     *
     * @example
     * const badge = pose.as("span").badge();
     * badge({ variant: "destructive", child: "Error" })
     * // → <span class="badge-destructive">Error</span>
     */
    badge(): PoseElement<BadgeProps, typeof BadgeSchema, TTag>;

    /**
     * Alert — maps to `.alert` / `.alert-destructive`.
     * Title renders in a `<strong>`, body in a `<section><p>`.
     *
     * @example
     * const alert = pose.as("div").alert();
     * alert({ title: "Heads up!", child: "Something needs your attention." })
     * // → <div class="alert"><strong>Heads up!</strong><section><p>Something…</p></section></div>
     */
    alert(): PoseElement<AlertProps, typeof AlertSchema, TTag>;

    /**
     * Card — maps to `.card`. Renders `<header>`, `<section>`, `<footer>`
     * automatically from props.
     *
     * @example
     * const card = pose.as("div").card();
     * card({ title: "Revenue", desc: "Last 30 days", child: "$12,400" })
     */
    card(): PoseElement<CardProps, typeof CardSchema, TTag>;

    /**
     * Input — applies the `.input` class with all ARIA/state attributes.
     * Works inside `.form` or `.field` wrappers too (basecoat styles both).
     *
     * @example
     * const input = pose.as("input").input_field();
     * input({ type: "email", name: "email", placeholder: "you@example.com", required: true })
     * // → <input class="input" type="email" name="email" placeholder="you@example.com" required>
     */
    input_field(): PoseElement<InputProps, typeof InputSchema, TTag>;

    /**
     * Textarea — applies the `.textarea` class with state attributes.
     *
     * @example
     * const ta = pose.as("textarea").textarea_field();
     * ta({ name: "message", placeholder: "Your message", rows: 5 })
     */
    textarea_field(): PoseElement<TextareaProps, typeof TextareaSchema, TTag>;

    /**
     * Label — applies `.label` class and `for` attribute.
     *
     * @example
     * const label = pose.as("label").label_field();
     * label({ for: "email", child: "Email address" })
     * // → <label class="label" for="email">Email address</label>
     */
    label_field(): PoseElement<LabelProps, typeof LabelSchema, TTag>;

    /**
     * Keyboard shortcut — applies `.kbd` class.
     *
     * @example
     * const kbd = pose.as("kbd").kbd();
     * kbd({ child: "⌘K" })
     * // → <kbd class="kbd">⌘K</kbd>
     */
    kbd(): PoseElement<KbdProps, typeof KbdSchema, TTag>;

    /**
     * Table — applies `.table` class, renders thead/tbody/tfoot/caption from props.
     *
     * @example
     * const table = pose.as("table").data_table();
     * table({
     *   head: "<tr><th>Name</th><th>Email</th></tr>",
     *   body: "<tr><td>Ada</td><td>ada@example.com</td></tr>",
     * })
     */
    data_table(): PoseElement<TableProps, typeof TableSchema, TTag>;

    /**
     * Tabs — applies `.tabs` class. Renders a `[role=tablist]` and
     * `[role=tabpanel]` for each tab entry.
     *
     * @example
     * const tabs = pose.as("div").tabs_group();
     * tabs({
     *   active: "account",
     *   tabs: [
     *     { id: "account", label: "Account", content: "<p>Account settings</p>" },
     *     { id: "security", label: "Security", content: "<p>Security settings</p>" },
     *   ],
     * })
     */
    tabs_group(): PoseElement<TabsProps, typeof TabsSchema, TTag>;

    /**
     * Tooltip — renders via basecoat's `data-tooltip` / `data-side` / `data-align`
     * attribute pattern (pure CSS, no JS required).
     *
     * @example
     * const tip = pose.as("span").tooltip();
     * tip({ tip: "Copy to clipboard", child: "📋" })
     * // → <span data-tooltip="Copy to clipboard" data-side="top" data-align="center">📋</span>
     */
    tooltip(): PoseElement<TooltipProps, typeof TooltipSchema, TTag>;
  }
}

// ---------------------------------------------------------------------------
// Class name helpers
// ---------------------------------------------------------------------------

/**
 * Derives the basecoat button class from variant + size.
 *
 * Basecoat naming convention:
 *   md  + primary  → "btn"            (no size or variant suffix)
 *   md  + {v}      → "btn-{v}"        (no size, just variant)
 *   {s} + primary  → "btn-{s}"        (size only)
 *   {s} + {v}      → "btn-{s}-{v}"    (both)
 *
 * "icon" is treated as a size modifier, not a standalone class — so:
 *   icon + primary → "btn-icon"
 *   icon + ghost   → "btn-icon-ghost"
 */
function btnClass(variant: BtnProps["variant"], size: BtnProps["size"]): string {
  const sizePrefix = size === "md" ? "" : `-${size}`;
  const variantSuffix = variant === "primary" ? "" : `-${variant}`;
  return `btn${sizePrefix}${variantSuffix}`;
}

/**
 * Derives the basecoat badge class from variant.
 *   primary → "badge"   (no suffix)
 *   others  → "badge-{variant}"
 */
function badgeClass(variant: BadgeProps["variant"]): string {
  return variant === "primary" ? "badge" : `badge-${variant}`;
}

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

export const basecoat: Preset<PoseElement<any, any, any>> = {
  name: "basecoat",

  extend(el) {
    // ── Button ───────────────────────────────────────────────────────────────
    el.btn = () =>
      el
        .input(BtnSchema)
        .cls(({ variant, size }) => btnClass(variant, size))
        .attr("disabled", ({ disabled }) => (disabled ? "" : null))
        .attr("aria-pressed", ({ pressed }) => (pressed ? "true" : null))
        .child(({ child }) => child);

    // ── Badge ────────────────────────────────────────────────────────────────
    el.badge = () =>
      el
        .input(BadgeSchema)
        .cls(({ variant }) => badgeClass(variant))
        .child(({ child }) => child);

    // ── Alert ────────────────────────────────────────────────────────────────
    el.alert = () =>
      el
        .input(AlertSchema)
        .cls(({ variant }) => (variant === "destructive" ? "alert-destructive" : "alert"))
        .child(
          ({ title, child }) =>
            (title ? `<strong>${title}</strong>` : "") +
            (child ? `<section><p>${child}</p></section>` : ""),
        );

    // ── Card ─────────────────────────────────────────────────────────────────
    el.card = () =>
      el
        .input(CardSchema)
        .cls("card")
        .child(
          ({ title, desc, child, footer }) =>
            (title || desc
              ? `<header>${title ? `<h2>${title}</h2>` : ""}${desc ? `<p>${desc}</p>` : ""}</header>`
              : "") +
            (child ? `<section>${child}</section>` : "") +
            (footer ? `<footer>${footer}</footer>` : ""),
        );

    // ── Input field ───────────────────────────────────────────────────────────
    // basecoat styles .input[type='text'] etc. — we apply the .input class
    // plus the type attribute so basecoat's selector matches.
    el.input_field = () =>
      el
        .input(InputSchema)
        .cls("input")
        .attr("type", ({ type }) => type)
        .attr("name", ({ name }) => name || null)
        .attr("placeholder", ({ placeholder }) => placeholder || null)
        .attr("value", ({ value }) => value || null)
        .attr("disabled", ({ disabled }) => (disabled ? "" : null))
        .attr("readonly", ({ readonly }) => (readonly ? "" : null))
        .attr("required", ({ required }) => (required ? "" : null))
        .attr("aria-invalid", ({ invalid }) => (invalid ? "true" : null));

    // ── Textarea ──────────────────────────────────────────────────────────────
    el.textarea_field = () =>
      el
        .input(TextareaSchema)
        .cls("textarea")
        .attr("name", ({ name }) => name || null)
        .attr("placeholder", ({ placeholder }) => placeholder || null)
        .attr("rows", ({ rows }) => String(rows))
        .attr("disabled", ({ disabled }) => (disabled ? "" : null))
        .attr("readonly", ({ readonly }) => (readonly ? "" : null))
        .attr("required", ({ required }) => (required ? "" : null))
        .attr("aria-invalid", ({ invalid }) => (invalid ? "true" : null))
        .child(({ child }) => child);

    // ── Label ─────────────────────────────────────────────────────────────────
    el.label_field = () =>
      el
        .input(LabelSchema)
        .cls("label")
        .attr("for", ({ for: f }) => f || null)
        .child(({ child }) => child);

    // ── Kbd ───────────────────────────────────────────────────────────────────
    el.kbd = () =>
      el
        .input(KbdSchema)
        .cls("kbd")
        .child(({ child }) => child);

    // ── Table ─────────────────────────────────────────────────────────────────
    el.data_table = () =>
      el
        .input(TableSchema)
        .cls("table")
        .child(
          ({ caption, head, body, foot }) =>
            (caption ? `<caption>${caption}</caption>` : "") +
            (head ? `<thead>${head}</thead>` : "") +
            (body ? `<tbody>${body}</tbody>` : "") +
            (foot ? `<tfoot>${foot}</tfoot>` : ""),
        );

    // ── Tabs ──────────────────────────────────────────────────────────────────
    el.tabs_group = () =>
      el
        .input(TabsSchema)
        .cls("tabs")
        .child(({ tabs, active }) => {
          const tablist = tabs
            .map(
              (t) =>
                `<button role="tab" aria-selected="${t.id === active ? "true" : "false"}" aria-controls="panel-${t.id}" id="tab-${t.id}">${t.label}</button>`,
            )
            .join("");

          const panels = tabs
            .map(
              (t) =>
                `<div role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}"${t.id !== active ? ' hidden=""' : ""}>${t.content}</div>`,
            )
            .join("");

          return `<div role="tablist">${tablist}</div>${panels}`;
        });

    // ── Tooltip ───────────────────────────────────────────────────────────────
    // basecoat tooltips are pure CSS via data-tooltip attribute — no class needed.
    el.tooltip = () =>
      el
        .input(TooltipSchema)
        .attr("data-tooltip", ({ tip }) => tip || null)
        .attr("data-side", ({ side }) => side)
        .attr("data-align", ({ align }) => align)
        .child(({ child }) => child);
  },
};
