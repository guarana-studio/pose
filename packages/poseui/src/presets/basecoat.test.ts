// =============================================================================
// src/presets/basecoat.test.ts — basecoat preset test suite
// Run with: bun test
// =============================================================================

import { describe, it, expect } from "bun:test";

import { createPose } from "poseui";
import { tailwind4 } from "poseui/presets";

import {
  basecoat,
  BtnSchema,
  BadgeSchema,
  AlertSchema,
  CardSchema,
  InputSchema,
  TextareaSchema,
  LabelSchema,
  KbdSchema,
  TableSchema,
  TabsSchema,
  TooltipSchema,
} from "./basecoat";

// ---------------------------------------------------------------------------
// Test pose instance
// ---------------------------------------------------------------------------

const pose = createPose({ presets: [tailwind4, basecoat] });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classes(html: string): string {
  return html.match(/class="([^"]+)"/)?.[1] ?? "";
}

function attr(html: string, name: string): string | undefined {
  const m = html.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function hasAttr(html: string, name: string): boolean {
  // Matches both boolean (just name) and valued (name="...")
  return new RegExp(`\\b${name}(?:=|\\s|>)`).test(html);
}

// ---------------------------------------------------------------------------
// btn()
// ---------------------------------------------------------------------------

describe("btn()", () => {
  const button = pose.as("button").btn();

  // ── Defaults ──────────────────────────────────────────────────────────────

  it("default props render class 'btn' (md + primary)", () => {
    expect(classes(button())).toBe("btn");
  });

  it("renders child text", () => {
    expect(button({ child: "Save" })).toContain(">Save<");
  });

  it("empty child renders empty button", () => {
    expect(button()).toContain("><");
  });

  // ── Variants (md size) ────────────────────────────────────────────────────

  it("variant primary → 'btn'", () => {
    expect(classes(button({ variant: "primary" }))).toBe("btn");
  });

  it("variant secondary → 'btn-secondary'", () => {
    expect(classes(button({ variant: "secondary" }))).toBe("btn-secondary");
  });

  it("variant outline → 'btn-outline'", () => {
    expect(classes(button({ variant: "outline" }))).toBe("btn-outline");
  });

  it("variant ghost → 'btn-ghost'", () => {
    expect(classes(button({ variant: "ghost" }))).toBe("btn-ghost");
  });

  it("variant link → 'btn-link'", () => {
    expect(classes(button({ variant: "link" }))).toBe("btn-link");
  });

  it("variant destructive → 'btn-destructive'", () => {
    expect(classes(button({ variant: "destructive" }))).toBe("btn-destructive");
  });

  // ── Sizes (primary variant) ───────────────────────────────────────────────

  it("size sm + primary → 'btn-sm'", () => {
    expect(classes(button({ size: "sm" }))).toBe("btn-sm");
  });

  it("size md + primary → 'btn'", () => {
    expect(classes(button({ size: "md" }))).toBe("btn");
  });

  it("size lg + primary → 'btn-lg'", () => {
    expect(classes(button({ size: "lg" }))).toBe("btn-lg");
  });

  it("size icon + primary → 'btn-icon'", () => {
    expect(classes(button({ size: "icon" }))).toBe("btn-icon");
  });

  // ── Size + variant combinations ───────────────────────────────────────────

  it("sm + secondary → 'btn-sm-secondary'", () => {
    expect(classes(button({ size: "sm", variant: "secondary" }))).toBe("btn-sm-secondary");
  });

  it("lg + secondary → 'btn-lg-secondary'", () => {
    expect(classes(button({ size: "lg", variant: "secondary" }))).toBe("btn-lg-secondary");
  });

  it("icon + secondary → 'btn-icon-secondary'", () => {
    expect(classes(button({ size: "icon", variant: "secondary" }))).toBe("btn-icon-secondary");
  });

  it("sm + outline → 'btn-sm-outline'", () => {
    expect(classes(button({ size: "sm", variant: "outline" }))).toBe("btn-sm-outline");
  });

  it("lg + outline → 'btn-lg-outline'", () => {
    expect(classes(button({ size: "lg", variant: "outline" }))).toBe("btn-lg-outline");
  });

  it("icon + outline → 'btn-icon-outline'", () => {
    expect(classes(button({ size: "icon", variant: "outline" }))).toBe("btn-icon-outline");
  });

  it("sm + ghost → 'btn-sm-ghost'", () => {
    expect(classes(button({ size: "sm", variant: "ghost" }))).toBe("btn-sm-ghost");
  });

  it("lg + ghost → 'btn-lg-ghost'", () => {
    expect(classes(button({ size: "lg", variant: "ghost" }))).toBe("btn-lg-ghost");
  });

  it("icon + ghost → 'btn-icon-ghost'", () => {
    expect(classes(button({ size: "icon", variant: "ghost" }))).toBe("btn-icon-ghost");
  });

  it("sm + link → 'btn-sm-link'", () => {
    expect(classes(button({ size: "sm", variant: "link" }))).toBe("btn-sm-link");
  });

  it("lg + link → 'btn-lg-link'", () => {
    expect(classes(button({ size: "lg", variant: "link" }))).toBe("btn-lg-link");
  });

  it("icon + link → 'btn-icon-link'", () => {
    expect(classes(button({ size: "icon", variant: "link" }))).toBe("btn-icon-link");
  });

  it("sm + destructive → 'btn-sm-destructive'", () => {
    expect(classes(button({ size: "sm", variant: "destructive" }))).toBe("btn-sm-destructive");
  });

  it("lg + destructive → 'btn-lg-destructive'", () => {
    expect(classes(button({ size: "lg", variant: "destructive" }))).toBe("btn-lg-destructive");
  });

  it("icon + destructive → 'btn-icon-destructive'", () => {
    expect(classes(button({ size: "icon", variant: "destructive" }))).toBe("btn-icon-destructive");
  });

  // ── disabled ──────────────────────────────────────────────────────────────

  it("disabled=true adds 'disabled' attribute", () => {
    expect(hasAttr(button({ disabled: true }), "disabled")).toBe(true);
  });

  it("disabled=false omits 'disabled' attribute", () => {
    expect(hasAttr(button({ disabled: false }), "disabled")).toBe(false);
  });

  it("disabled=true (default false) omits disabled by default", () => {
    expect(hasAttr(button(), "disabled")).toBe(false);
  });

  // ── pressed ───────────────────────────────────────────────────────────────

  it("pressed=true adds aria-pressed='true'", () => {
    expect(attr(button({ pressed: true }), "aria-pressed")).toBe("true");
  });

  it("pressed=false omits aria-pressed", () => {
    expect(hasAttr(button({ pressed: false }), "aria-pressed")).toBe(false);
  });

  it("pressed defaults to false — no aria-pressed by default", () => {
    expect(hasAttr(button(), "aria-pressed")).toBe(false);
  });

  // ── HTML structure ────────────────────────────────────────────────────────

  it("renders a <button> element", () => {
    expect(button()).toMatch(/^<button/);
    expect(button()).toMatch(/<\/button>$/);
  });

  it("full render — lg destructive disabled", () => {
    expect(button({ variant: "destructive", size: "lg", disabled: true, child: "Delete" })).toBe(
      '<button class="btn-lg-destructive" disabled>Delete</button>',
    );
  });

  it("full render — sm secondary pressed", () => {
    expect(button({ variant: "secondary", size: "sm", pressed: true, child: "Toggle" })).toBe(
      '<button class="btn-sm-secondary" aria-pressed="true">Toggle</button>',
    );
  });
});

// ---------------------------------------------------------------------------
// badge()
// ---------------------------------------------------------------------------

describe("badge()", () => {
  const badge = pose.as("span").badge();

  it("default variant → class 'badge'", () => {
    expect(classes(badge())).toBe("badge");
  });

  it("variant primary → 'badge'", () => {
    expect(classes(badge({ variant: "primary" }))).toBe("badge");
  });

  it("variant secondary → 'badge-secondary'", () => {
    expect(classes(badge({ variant: "secondary" }))).toBe("badge-secondary");
  });

  it("variant destructive → 'badge-destructive'", () => {
    expect(classes(badge({ variant: "destructive" }))).toBe("badge-destructive");
  });

  it("variant outline → 'badge-outline'", () => {
    expect(classes(badge({ variant: "outline" }))).toBe("badge-outline");
  });

  it("renders child text", () => {
    expect(badge({ child: "New" })).toContain(">New<");
  });

  it("renders a <span> element", () => {
    expect(badge()).toMatch(/^<span/);
    expect(badge()).toMatch(/<\/span>$/);
  });

  it("full render — destructive", () => {
    expect(badge({ variant: "destructive", child: "Error" })).toBe(
      '<span class="badge-destructive">Error</span>',
    );
  });
});

// ---------------------------------------------------------------------------
// alert()
// ---------------------------------------------------------------------------

describe("alert()", () => {
  const alert = pose.as("div").alert();

  it("default variant → class 'alert'", () => {
    expect(classes(alert())).toBe("alert");
  });

  it("variant default → 'alert'", () => {
    expect(classes(alert({ variant: "default" }))).toBe("alert");
  });

  it("variant destructive → 'alert-destructive'", () => {
    expect(classes(alert({ variant: "destructive" }))).toBe("alert-destructive");
  });

  it("renders title in a <strong>", () => {
    expect(alert({ title: "Heads up!" })).toContain("<strong>Heads up!</strong>");
  });

  it("renders body in <section><p>", () => {
    expect(alert({ child: "Something went wrong." })).toContain(
      "<section><p>Something went wrong.</p></section>",
    );
  });

  it("renders both title and body", () => {
    const html = alert({ title: "Error", child: "Try again." });
    expect(html).toContain("<strong>Error</strong>");
    expect(html).toContain("<section><p>Try again.</p></section>");
  });

  it("no title — omits <strong>", () => {
    expect(alert({ child: "Body only." })).not.toContain("<strong>");
  });

  it("no child — omits <section>", () => {
    expect(alert({ title: "Title only." })).not.toContain("<section>");
  });

  it("full render — destructive with title and body", () => {
    expect(alert({ variant: "destructive", title: "Error", child: "Failed." })).toBe(
      '<div class="alert-destructive"><strong>Error</strong><section><p>Failed.</p></section></div>',
    );
  });
});

// ---------------------------------------------------------------------------
// card()
// ---------------------------------------------------------------------------

describe("card()", () => {
  const card = pose.as("div").card();

  it("applies class 'card'", () => {
    expect(classes(card())).toBe("card");
  });

  it("renders title in <header><h2>", () => {
    expect(card({ title: "Revenue" })).toContain("<h2>Revenue</h2>");
  });

  it("renders desc in <header><p>", () => {
    expect(card({ desc: "Last 30 days" })).toContain("<p>Last 30 days</p>");
  });

  it("renders both title and desc inside a single <header>", () => {
    const html = card({ title: "Stats", desc: "Q4" });
    const header = html.match(/<header>(.*?)<\/header>/s)?.[1] ?? "";
    expect(header).toContain("<h2>Stats</h2>");
    expect(header).toContain("<p>Q4</p>");
  });

  it("no title or desc — omits <header>", () => {
    expect(card({ child: "body" })).not.toContain("<header>");
  });

  it("renders child in <section>", () => {
    expect(card({ child: "<p>Content</p>" })).toContain("<section><p>Content</p></section>");
  });

  it("no child — omits <section>", () => {
    expect(card({ title: "Title" })).not.toContain("<section>");
  });

  it("renders footer in <footer>", () => {
    expect(card({ footer: "Cancel" })).toContain("<footer>Cancel</footer>");
  });

  it("no footer — omits <footer>", () => {
    expect(card({ child: "body" })).not.toContain("<footer>");
  });

  it("full render", () => {
    expect(card({ title: "Revenue", desc: "Q4", child: "$12k", footer: "View all" })).toBe(
      '<div class="card"><header><h2>Revenue</h2><p>Q4</p></header><section>$12k</section><footer>View all</footer></div>',
    );
  });
});

// ---------------------------------------------------------------------------
// input_field()
// ---------------------------------------------------------------------------

describe("input_field()", () => {
  const input = pose.as("input").input_field();

  it("applies class 'input'", () => {
    expect(classes(input())).toBe("input");
  });

  it("default type is 'text'", () => {
    expect(attr(input(), "type")).toBe("text");
  });

  it("renders correct type attribute", () => {
    const types = [
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
    ] as const;
    for (const type of types) {
      expect(attr(input({ type }), "type")).toBe(type);
    }
  });

  it("renders name attribute when provided", () => {
    expect(attr(input({ name: "email" }), "name")).toBe("email");
  });

  it("omits name when empty string", () => {
    expect(hasAttr(input(), "name")).toBe(false);
  });

  it("renders placeholder when provided", () => {
    expect(attr(input({ placeholder: "Enter email" }), "placeholder")).toBe("Enter email");
  });

  it("omits placeholder when empty string", () => {
    expect(hasAttr(input(), "placeholder")).toBe(false);
  });

  it("renders value when provided", () => {
    expect(attr(input({ value: "ada@example.com" }), "value")).toBe("ada@example.com");
  });

  it("omits value when empty string", () => {
    expect(hasAttr(input(), "value")).toBe(false);
  });

  it("disabled=true adds 'disabled' attribute", () => {
    expect(hasAttr(input({ disabled: true }), "disabled")).toBe(true);
  });

  it("disabled=false omits 'disabled'", () => {
    expect(hasAttr(input({ disabled: false }), "disabled")).toBe(false);
  });

  it("readonly=true adds 'readonly' attribute", () => {
    expect(hasAttr(input({ readonly: true }), "readonly")).toBe(true);
  });

  it("readonly=false omits 'readonly'", () => {
    expect(hasAttr(input({ readonly: false }), "readonly")).toBe(false);
  });

  it("required=true adds 'required' attribute", () => {
    expect(hasAttr(input({ required: true }), "required")).toBe(true);
  });

  it("required=false omits 'required'", () => {
    expect(hasAttr(input({ required: false }), "required")).toBe(false);
  });

  it("invalid=true adds aria-invalid='true'", () => {
    expect(attr(input({ invalid: true }), "aria-invalid")).toBe("true");
  });

  it("invalid=false omits aria-invalid", () => {
    expect(hasAttr(input({ invalid: false }), "aria-invalid")).toBe(false);
  });

  it("full render — email, required, invalid", () => {
    expect(
      input({
        type: "email",
        name: "email",
        placeholder: "you@example.com",
        required: true,
        invalid: true,
      }),
    ).toBe(
      '<input class="input" type="email" name="email" placeholder="you@example.com" required aria-invalid="true"></input>',
    );
  });
});

// ---------------------------------------------------------------------------
// textarea_field()
// ---------------------------------------------------------------------------

describe("textarea_field()", () => {
  const textarea = pose.as("textarea").textarea_field();

  it("applies class 'textarea'", () => {
    expect(classes(textarea())).toBe("textarea");
  });

  it("renders name attribute", () => {
    expect(attr(textarea({ name: "message" }), "name")).toBe("message");
  });

  it("omits name when empty", () => {
    expect(hasAttr(textarea(), "name")).toBe(false);
  });

  it("renders placeholder", () => {
    expect(attr(textarea({ placeholder: "Your message" }), "placeholder")).toBe("Your message");
  });

  it("renders rows attribute", () => {
    expect(attr(textarea({ rows: 5 }), "rows")).toBe("5");
  });

  it("default rows is 3", () => {
    expect(attr(textarea(), "rows")).toBe("3");
  });

  it("disabled=true adds 'disabled'", () => {
    expect(hasAttr(textarea({ disabled: true }), "disabled")).toBe(true);
  });

  it("readonly=true adds 'readonly'", () => {
    expect(hasAttr(textarea({ readonly: true }), "readonly")).toBe(true);
  });

  it("required=true adds 'required'", () => {
    expect(hasAttr(textarea({ required: true }), "required")).toBe(true);
  });

  it("invalid=true adds aria-invalid='true'", () => {
    expect(attr(textarea({ invalid: true }), "aria-invalid")).toBe("true");
  });

  it("renders child content (initial value)", () => {
    expect(textarea({ child: "Hello" })).toContain(">Hello<");
  });

  it("full render", () => {
    expect(
      textarea({ name: "message", placeholder: "Your message", rows: 4, required: true }),
    ).toBe(
      '<textarea class="textarea" name="message" placeholder="Your message" rows="4" required></textarea>',
    );
  });
});

// ---------------------------------------------------------------------------
// label_field()
// ---------------------------------------------------------------------------

describe("label_field()", () => {
  const label = pose.as("label").label_field();

  it("applies class 'label'", () => {
    expect(classes(label())).toBe("label");
  });

  it("renders for attribute when provided", () => {
    expect(attr(label({ for: "email" }), "for")).toBe("email");
  });

  it("omits for when empty string", () => {
    expect(hasAttr(label(), "for")).toBe(false);
  });

  it("renders child text", () => {
    expect(label({ child: "Email address" })).toContain(">Email address<");
  });

  it("full render", () => {
    expect(label({ for: "email", child: "Email address" })).toBe(
      '<label class="label" for="email">Email address</label>',
    );
  });
});

// ---------------------------------------------------------------------------
// kbd()
// ---------------------------------------------------------------------------

describe("kbd()", () => {
  const kbd = pose.as("kbd").kbd();

  it("applies class 'kbd'", () => {
    expect(classes(kbd())).toBe("kbd");
  });

  it("renders child text", () => {
    expect(kbd({ child: "⌘K" })).toContain(">⌘K<");
  });

  it("full render", () => {
    expect(kbd({ child: "⌘K" })).toBe('<kbd class="kbd">⌘K</kbd>');
  });
});

// ---------------------------------------------------------------------------
// data_table()
// ---------------------------------------------------------------------------

describe("data_table()", () => {
  const table = pose.as("table").data_table();

  it("applies class 'table'", () => {
    expect(classes(table())).toBe("table");
  });

  it("renders thead when head is provided", () => {
    expect(table({ head: "<tr><th>Name</th></tr>" })).toContain(
      "<thead><tr><th>Name</th></tr></thead>",
    );
  });

  it("renders tbody when body is provided", () => {
    expect(table({ body: "<tr><td>Ada</td></tr>" })).toContain(
      "<tbody><tr><td>Ada</td></tr></tbody>",
    );
  });

  it("renders tfoot when foot is provided", () => {
    expect(table({ foot: "<tr><td>Total</td></tr>" })).toContain(
      "<tfoot><tr><td>Total</td></tr></tfoot>",
    );
  });

  it("renders caption when provided", () => {
    expect(table({ caption: "Monthly sales" })).toContain("<caption>Monthly sales</caption>");
  });

  it("omits thead when head is empty", () => {
    expect(table({ body: "<tr><td>x</td></tr>" })).not.toContain("<thead>");
  });

  it("omits tbody when body is empty", () => {
    expect(table({ head: "<tr><th>x</th></tr>" })).not.toContain("<tbody>");
  });

  it("omits tfoot when foot is not provided", () => {
    expect(table({ body: "<tr><td>x</td></tr>" })).not.toContain("<tfoot>");
  });

  it("omits caption when not provided", () => {
    expect(table({ body: "<tr><td>x</td></tr>" })).not.toContain("<caption>");
  });

  it("renders a <table> element", () => {
    expect(table()).toMatch(/^<table/);
    expect(table()).toMatch(/<\/table>$/);
  });

  it("full render", () => {
    expect(
      table({
        caption: "Users",
        head: "<tr><th>Name</th></tr>",
        body: "<tr><td>Ada</td></tr>",
      }),
    ).toBe(
      '<table class="table"><caption>Users</caption><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Ada</td></tr></tbody></table>',
    );
  });
});

// ---------------------------------------------------------------------------
// tabs_group()
// ---------------------------------------------------------------------------

describe("tabs_group()", () => {
  const tabs = pose.as("div").tabs_group();

  const sampleTabs = [
    { id: "account", label: "Account", content: "<p>Account settings</p>" },
    { id: "security", label: "Security", content: "<p>Security settings</p>" },
  ];

  it("applies class 'tabs'", () => {
    expect(classes(tabs({ tabs: sampleTabs, active: "account" }))).toBe("tabs");
  });

  it("renders a [role=tablist]", () => {
    expect(tabs({ tabs: sampleTabs, active: "account" })).toContain('role="tablist"');
  });

  it("renders a [role=tab] button per tab", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html.match(/role="tab"/g)?.length).toBe(2);
  });

  it("active tab has aria-selected='true'", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html).toContain('aria-selected="true"');
  });

  it("inactive tab has aria-selected='false'", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    const matches = html.match(/aria-selected="false"/g);
    expect(matches?.length).toBe(1);
  });

  it("renders tab labels", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html).toContain(">Account<");
    expect(html).toContain(">Security<");
  });

  it("renders a [role=tabpanel] per tab", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html.match(/role="tabpanel"/g)?.length).toBe(2);
  });

  it("active panel has no hidden attribute", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    // The active panel (account) should NOT contain hidden=""
    const accountPanel = html.match(/id="panel-account"[^>]*>/)?.[0] ?? "";
    expect(accountPanel).not.toContain("hidden");
  });

  it("inactive panels have hidden attribute", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    const securityPanel = html.match(/id="panel-security"[^>]*>/)?.[0] ?? "";
    expect(securityPanel).toContain("hidden");
  });

  it("renders panel content", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html).toContain("<p>Account settings</p>");
    expect(html).toContain("<p>Security settings</p>");
  });

  it("aria-controls on tab points to panel id", () => {
    const html = tabs({ tabs: sampleTabs, active: "account" });
    expect(html).toContain('aria-controls="panel-account"');
    expect(html).toContain('aria-controls="panel-security"');
  });

  it("empty tabs array renders tablist with no tabs", () => {
    const html = tabs({ tabs: [], active: "" });
    expect(html).toContain('role="tablist"');
    expect(html).not.toContain('role="tab"');
  });
});

// ---------------------------------------------------------------------------
// tooltip()
// ---------------------------------------------------------------------------

describe("tooltip()", () => {
  const tooltip = pose.as("span").tooltip();

  it("renders data-tooltip attribute", () => {
    expect(attr(tooltip({ tip: "Copy to clipboard" }), "data-tooltip")).toBe("Copy to clipboard");
  });

  it("omits data-tooltip when tip is empty", () => {
    expect(hasAttr(tooltip(), "data-tooltip")).toBe(false);
  });

  it("default side is 'top'", () => {
    expect(attr(tooltip({ tip: "hi" }), "data-side")).toBe("top");
  });

  it("renders data-side attribute", () => {
    const sides = ["top", "bottom", "left", "right"] as const;
    for (const side of sides) {
      expect(attr(tooltip({ tip: "hi", side }), "data-side")).toBe(side);
    }
  });

  it("default align is 'center'", () => {
    expect(attr(tooltip({ tip: "hi" }), "data-align")).toBe("center");
  });

  it("renders data-align attribute", () => {
    const aligns = ["start", "center", "end"] as const;
    for (const align of aligns) {
      expect(attr(tooltip({ tip: "hi", align }), "data-align")).toBe(align);
    }
  });

  it("renders child content", () => {
    expect(tooltip({ tip: "hi", child: "📋" })).toContain(">📋<");
  });

  it("applies no class — basecoat tooltip is attr-driven", () => {
    expect(classes(tooltip({ tip: "hi" }))).toBe("");
  });

  it("full render", () => {
    expect(tooltip({ tip: "Copy", side: "bottom", align: "start", child: "📋" })).toBe(
      '<span data-tooltip="Copy" data-side="bottom" data-align="start">📋</span>',
    );
  });
});

// ---------------------------------------------------------------------------
// Exported schemas
// ---------------------------------------------------------------------------

describe("exported schemas", () => {
  it("BtnSchema has correct defaults", () => {
    const result = BtnSchema.parse({});
    expect(result.variant).toBe("primary");
    expect(result.size).toBe("md");
    expect(result.disabled).toBe(false);
    expect(result.pressed).toBe(false);
    expect(result.child).toBe("");
  });

  it("BadgeSchema has correct defaults", () => {
    const result = BadgeSchema.parse({});
    expect(result.variant).toBe("primary");
    expect(result.child).toBe("");
  });

  it("AlertSchema has correct defaults", () => {
    const result = AlertSchema.parse({});
    expect(result.variant).toBe("default");
    expect(result.child).toBe("");
    expect(result.title).toBeUndefined();
  });

  it("CardSchema has correct defaults", () => {
    const result = CardSchema.parse({});
    expect(result.child).toBe("");
    expect(result.title).toBeUndefined();
    expect(result.desc).toBeUndefined();
    expect(result.footer).toBeUndefined();
  });

  it("InputSchema has correct defaults", () => {
    const result = InputSchema.parse({});
    expect(result.type).toBe("text");
    expect(result.disabled).toBe(false);
    expect(result.required).toBe(false);
    expect(result.invalid).toBe(false);
  });

  it("TextareaSchema has correct defaults", () => {
    const result = TextareaSchema.parse({});
    expect(result.rows).toBe(3);
    expect(result.disabled).toBe(false);
  });

  it("LabelSchema has correct defaults", () => {
    const result = LabelSchema.parse({});
    expect(result.for).toBe("");
    expect(result.child).toBe("");
  });

  it("KbdSchema has correct defaults", () => {
    expect(KbdSchema.parse({}).child).toBe("");
  });

  it("TableSchema has correct defaults", () => {
    const result = TableSchema.parse({});
    expect(result.head).toBe("");
    expect(result.body).toBe("");
    expect(result.caption).toBeUndefined();
    expect(result.foot).toBeUndefined();
  });

  it("TabsSchema has correct defaults", () => {
    const result = TabsSchema.parse({});
    expect(result.tabs).toEqual([]);
    expect(result.active).toBe("");
  });

  it("TooltipSchema has correct defaults", () => {
    const result = TooltipSchema.parse({});
    expect(result.side).toBe("top");
    expect(result.align).toBe("center");
    expect(result.tip).toBe("");
    expect(result.child).toBe("");
  });

  it("BtnSchema can be extended with Zod", () => {
    const { z } = require("zod");
    const Extended = BtnSchema.extend({ loading: z.boolean().default(false) });
    const result = Extended.parse({});
    expect(result.loading).toBe(false);
    expect(result.variant).toBe("primary"); // original fields preserved
  });
});

// ---------------------------------------------------------------------------
// Preset composability
// ---------------------------------------------------------------------------

describe("composability", () => {
  it("btn() is further composable with .cls()", () => {
    const customButton = pose.as("button").btn();
    // The returned element can be called — it already has btn() wired up
    const html = customButton({ variant: "primary", size: "md", child: "OK" });
    expect(classes(html)).toBe("btn");
  });

  it("two different component methods on separate elements are independent", () => {
    const button = pose.as("button").btn();
    const badge = pose.as("span").badge();

    expect(button({ child: "Save" })).toMatch(/^<button/);
    expect(badge({ child: "New" })).toMatch(/^<span/);
  });

  it("btn() can be created multiple times from the same pose instance", () => {
    const b1 = pose.as("button").btn();
    const b2 = pose.as("button").btn();

    expect(b1({ variant: "primary" })).toBe(b2({ variant: "primary" }));
    expect(b1({ variant: "destructive", size: "lg" })).toBe(
      b2({ variant: "destructive", size: "lg" }),
    );
  });

  it("different html tags produce different element types", () => {
    const buttonBtn = pose.as("button").btn();
    const aBtn = pose.as("a").btn();

    expect(buttonBtn({ child: "Click" })).toMatch(/^<button/);
    expect(aBtn({ child: "Click" })).toMatch(/^<a/);
  });

  it("tailwind4 and basecoat presets coexist — tailwind4 methods available alongside btn()", () => {
    // tailwind4 methods should still work on pose instance that also has basecoat
    const el = pose.as("div").flex().gap(4);
    expect(classes(el())).toContain("flex");
    expect(classes(el())).toContain("gap-4");
  });
});
