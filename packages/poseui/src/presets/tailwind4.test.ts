// =============================================================================
// src/presets/tailwind4.test.ts — tailwind4 preset test suite
// Every test here requires the tailwind4 preset.
// Run with: bun test
// =============================================================================

import { it, expect, describe } from "bun:test";

import { createPose } from "poseui";
import { tailwind4 } from "poseui/presets";
import { z } from "zod";

const pose = createPose({ presets: [tailwind4] });

// ---------------------------------------------------------------------------
// Styling — basic utility methods
// ---------------------------------------------------------------------------

describe("styling", () => {
  it("applies a single static class", () => {
    expect(pose.as("div").flex()()).toEqual('<div class="flex"></div>');
  });

  it("applies multiple classes in chain order", () => {
    expect(pose.as("div").flex().items_center().gap(4)()).toEqual(
      '<div class="flex items-center gap-4"></div>',
    );
  });

  it("applies dynamic class from a function", () => {
    const el = pose
      .as("div")
      .input(z.object({ variant: z.enum(["primary", "secondary"]).default("primary") }))
      .bg(({ variant }) => (variant === "primary" ? "blue-500" : "neutral-500"));

    expect(el({ variant: "primary" })).toEqual('<div class="bg-blue-500"></div>');
    expect(el({ variant: "secondary" })).toEqual('<div class="bg-neutral-500"></div>');
  });

  it("applies mix of static and dynamic classes", () => {
    const el = pose
      .as("button")
      .input(z.object({ active: z.boolean().default(false) }))
      .flex()
      .rounded()
      .opacity(({ active }) => (active ? 100 : 50));

    expect(el({ active: true })).toEqual('<button class="flex rounded opacity-100"></button>');
    expect(el({ active: false })).toEqual('<button class="flex rounded opacity-50"></button>');
  });

  it("can be placed after .input()", () => {
    const el = pose
      .as("div")
      .flex()
      .gap(2)
      .input(z.object({ label: z.string() }))
      .child(({ label }) => label);

    expect(el({ label: "test" })).toEqual('<div class="flex gap-2">test</div>');
  });
});

// ---------------------------------------------------------------------------
// .when() — predicate form
// ---------------------------------------------------------------------------

describe(".when() predicate form", () => {
  it("applies classes when predicate is true", () => {
    const el = pose
      .as("button")
      .input(z.object({ disabled: z.boolean().default(false) }))
      .when(
        ({ disabled }) => disabled,
        (b) => b.opacity(50).cursor_not_allowed(),
      );

    expect(el({ disabled: true })).toEqual(
      '<button class="opacity-50 cursor-not-allowed"></button>',
    );
  });

  it("emits no classes when predicate is false", () => {
    const el = pose
      .as("button")
      .input(z.object({ disabled: z.boolean().default(false) }))
      .when(
        ({ disabled }) => disabled,
        (b) => b.opacity(50).cursor_not_allowed(),
      );

    expect(el({ disabled: false })).toEqual("<button></button>");
  });

  it("stacks multiple predicate when() calls independently", () => {
    const el = pose
      .as("div")
      .input(z.object({ bold: z.boolean().default(false), italic: z.boolean().default(false) }))
      .when(
        ({ bold }) => bold,
        (b) => b.font_bold(),
      )
      .when(
        ({ italic }) => italic,
        (b) => b.italic(),
      );

    expect(el({ bold: true, italic: false })).toEqual('<div class="font-bold"></div>');
    expect(el({ bold: false, italic: true })).toEqual('<div class="italic"></div>');
    expect(el({ bold: true, italic: true })).toEqual('<div class="font-bold italic"></div>');
    expect(el({ bold: false, italic: false })).toEqual("<div></div>");
  });

  it("combines with base styles correctly", () => {
    const el = pose
      .as("div")
      .input(z.object({ active: z.boolean().default(false) }))
      .flex()
      .rounded()
      .when(
        ({ active }) => active,
        (b) => b.ring_w(2).ring_color("blue-500"),
      );

    expect(el({ active: true })).toEqual('<div class="flex rounded ring-2 ring-blue-500"></div>');
    expect(el({ active: false })).toEqual('<div class="flex rounded"></div>');
  });

  it("supports multi-field predicates", () => {
    const el = pose
      .as("button")
      .input(
        z.object({
          variant: z.enum(["primary", "secondary"]).default("primary"),
          disabled: z.boolean().default(false),
        }),
      )
      .when(
        ({ variant, disabled }) => variant === "primary" && !disabled,
        (b) => b.bg("blue-600"),
      );

    expect(el({ variant: "primary", disabled: false })).toEqual(
      '<button class="bg-blue-600"></button>',
    );
    expect(el({ variant: "primary", disabled: true })).toEqual("<button></button>");
    expect(el({ variant: "secondary", disabled: false })).toEqual("<button></button>");
  });
});

// ---------------------------------------------------------------------------
// .when() — value switch form
// ---------------------------------------------------------------------------

describe(".when() value switch form", () => {
  it("applies matching case", () => {
    const el = pose
      .as("button")
      .input(z.object({ variant: z.enum(["primary", "secondary"]).default("primary") }))
      .when("variant", {
        primary: (b) => b.bg("blue-500"),
        secondary: (b) => b.bg("neutral-500"),
      });

    expect(el({ variant: "primary" })).toEqual('<button class="bg-blue-500"></button>');
    expect(el({ variant: "secondary" })).toEqual('<button class="bg-neutral-500"></button>');
  });

  it("emits no classes for an unhandled case (Partial)", () => {
    const el = pose
      .as("button")
      .input(z.object({ variant: z.enum(["primary", "secondary", "ghost"]).default("primary") }))
      .when("variant", {
        primary: (b) => b.bg("blue-500"),
        // secondary and ghost intentionally omitted
      });

    expect(el({ variant: "ghost" })).toEqual("<button></button>");
  });

  it("stacks multiple value when() calls", () => {
    const el = pose
      .as("button")
      .input(
        z.object({
          variant: z.enum(["primary", "secondary"]).default("primary"),
          size: z.enum(["sm", "md", "lg"]).default("md"),
        }),
      )
      .when("variant", {
        primary: (b) => b.bg("blue-500").text_color("white"),
        secondary: (b) => b.bg("neutral-200").text_color("neutral-900"),
      })
      .when("size", {
        sm: (b) => b.px(2).py(1).text_sm(),
        md: (b) => b.px(4).py(2).text_base(),
        lg: (b) => b.px(6).py(3).text_lg(),
      });

    expect(el({ variant: "primary", size: "sm" })).toEqual(
      '<button class="bg-blue-500 text-white px-2 py-1 text-sm"></button>',
    );
    expect(el({ variant: "secondary", size: "lg" })).toEqual(
      '<button class="bg-neutral-200 text-neutral-900 px-6 py-3 text-lg"></button>',
    );
  });

  it("mixes value and predicate when() calls", () => {
    const el = pose
      .as("button")
      .input(
        z.object({
          variant: z.enum(["primary", "secondary"]).default("primary"),
          disabled: z.boolean().default(false),
        }),
      )
      .when("variant", {
        primary: (b) => b.bg("blue-500"),
        secondary: (b) => b.bg("neutral-500"),
      })
      .when(
        ({ disabled }) => disabled,
        (b) => b.opacity(50).pointer_events_none(),
      );

    expect(el({ variant: "primary", disabled: true })).toEqual(
      '<button class="bg-blue-500 opacity-50 pointer-events-none"></button>',
    );
    expect(el({ variant: "secondary", disabled: false })).toEqual(
      '<button class="bg-neutral-500"></button>',
    );
  });

  it("branch builder emits multiple classes", () => {
    const el = pose
      .as("div")
      .input(z.object({ size: z.enum(["sm", "lg"]).default("sm") }))
      .when("size", {
        sm: (b) => b.p(2).text_sm().rounded(),
        lg: (b) => b.p(6).text_lg().rounded("xl"),
      });

    expect(el({ size: "sm" })).toEqual('<div class="p-2 text-sm rounded"></div>');
    expect(el({ size: "lg" })).toEqual('<div class="p-6 text-lg rounded-xl"></div>');
  });
});

// ---------------------------------------------------------------------------
// .attr() with tailwind classes alongside
// ---------------------------------------------------------------------------

describe(".attr() with tailwind classes", () => {
  it("renders attributes alongside classes", () => {
    const el = pose.as("a").flex().text_color("blue-600").attr("href", "/home");
    expect(el()).toEqual('<a class="flex text-blue-600" href="/home"></a>');
  });

  it("TTag is preserved through .when() using tailwind methods", () => {
    const el = pose
      .as("button")
      .input(z.object({ disabled: z.boolean().default(false) }))
      .when(
        ({ disabled }) => disabled,
        (b) => b.opacity(50),
      )
      .attr("type", "submit");

    expect(el({ disabled: false })).toEqual('<button type="submit"></button>');
    expect(el({ disabled: true })).toEqual('<button class="opacity-50" type="submit"></button>');
  });

  it("attr value inferred from TTag works dynamically alongside classes", () => {
    const el = pose
      .as("input")
      .input(z.object({ kind: z.enum(["email", "password", "text"]).default("text") }))
      .attr("type", ({ kind }) => kind);

    expect(el({ kind: "email" })).toEqual('<input type="email"></input>');
    expect(el({ kind: "password" })).toEqual('<input type="password"></input>');
  });
});

// ---------------------------------------------------------------------------
// .attrs() with tailwind classes alongside
// ---------------------------------------------------------------------------

describe(".attrs() with tailwind classes", () => {
  it("renders attrs alongside classes and children", () => {
    const el = pose
      .as("a")
      .input(z.object({ url: z.string(), label: z.string() }))
      .flex()
      .items_center()
      .text_color("blue-600")
      .attrs(({ url }) => ({ href: url, target: "_blank" }))
      .child(({ label }) => label);

    expect(el({ url: "/about", label: "About" })).toEqual(
      '<a class="flex items-center text-blue-600" href="/about" target="_blank">About</a>',
    );
  });
});

// ---------------------------------------------------------------------------
// .getClasses() with tailwind methods
// ---------------------------------------------------------------------------

describe(".getClasses()", () => {
  it("returns static classes without calling the element", () => {
    const el = pose.as("div").flex().items_center().p(4);
    expect(el.getClasses()).toEqual("flex items-center p-4");
  });

  it("matches the class attribute on the rendered element", () => {
    const el = pose.as("div").flex().gap(2).rounded().font_bold();
    const html = el();
    const classAttr = html.match(/class="([^"]+)"/)?.[1] ?? "";
    expect(el.getClasses()).toEqual(classAttr);
  });

  it("evaluates dynamic class entries against supplied props", () => {
    const el = pose
      .as("button")
      .input(z.object({ disabled: z.boolean().default(false) }))
      .flex()
      .opacity(({ disabled }) => (disabled ? 50 : 100));

    expect(el.getClasses({ disabled: true })).toEqual("flex opacity-50");
    expect(el.getClasses({ disabled: false })).toEqual("flex opacity-100");
  });

  it("defaults props to {} — inactive .when() contributes nothing", () => {
    const el = pose
      .as("div")
      .input(z.object({ active: z.boolean().default(false) }))
      .flex()
      .when(
        ({ active }) => active,
        (b) => b.ring_w(2),
      );

    expect(el.getClasses()).toEqual("flex");
  });

  it("resolves .when() value-switch branches against props", () => {
    const el = pose
      .as("button")
      .input(z.object({ variant: z.enum(["primary", "secondary"]).default("primary") }))
      .when("variant", {
        primary: (b) => b.bg("indigo-600").text_color("white"),
        secondary: (b) => b.bg("slate-200").text_color("slate-900"),
      });

    expect(el.getClasses({ variant: "primary" })).toEqual("bg-indigo-600 text-white");
    expect(el.getClasses({ variant: "secondary" })).toEqual("bg-slate-200 text-slate-900");
  });

  it("survives .input() placed after style methods", () => {
    const el = pose
      .as("div")
      .flex()
      .gap(4)
      .input(z.object({ size: z.enum(["sm", "lg"]).default("sm") }))
      .when("size", {
        sm: (b) => b.p(2),
        lg: (b) => b.p(8),
      });

    expect(el.getClasses({ size: "sm" })).toEqual("flex gap-4 p-2");
    expect(el.getClasses({ size: "lg" })).toEqual("flex gap-4 p-8");
  });
});

// ---------------------------------------------------------------------------
// getAllClasses() with tailwind preset
// ---------------------------------------------------------------------------

describe("getAllClasses() with tailwind4", () => {
  it("fresh instance per test — registries are isolated", () => {
    const a = createPose({ presets: [tailwind4] });
    const b = createPose({ presets: [tailwind4] });
    a.as("div").flex().p(4);
    expect(b.getAllClasses()).toEqual("");
  });

  it("collects static classes from a single element", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div").flex().items_center().gap(4);
    expect(p.getAllClasses()).toEqual("flex items-center gap-4");
  });

  it("collects static classes across multiple elements", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("button").px(4).py(2).rounded().font_semibold();
    p.as("span").text_xs().font_bold().text_color("slate-500");
    const all = p.getAllClasses();
    for (const cls of [
      "px-4",
      "py-2",
      "rounded",
      "font-semibold",
      "text-xs",
      "font-bold",
      "text-slate-500",
    ]) {
      expect(all).toContain(cls);
    }
  });

  it("deduplicates classes shared across elements", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div").flex().gap(4);
    p.as("section").flex().gap(4).p(8);
    const classes = p.getAllClasses().split(" ");
    expect(classes.filter((c) => c === "flex").length).toBe(1);
    expect(classes.filter((c) => c === "gap-4").length).toBe(1);
  });

  it("does not include dynamic (function) class entries", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div")
      .input(z.object({ active: z.boolean().default(false) }))
      .flex()
      .opacity(({ active }) => (active ? 100 : 50));

    const all = p.getAllClasses();
    expect(all).toContain("flex");
    expect(all).not.toContain("opacity-100");
    expect(all).not.toContain("opacity-50");
  });

  it("picks up all classes from a fluent chain", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div").flex().flex_col().items_center().justify_between().gap(6);
    const all = p.getAllClasses();
    for (const cls of ["flex", "flex-col", "items-center", "justify-between", "gap-6"]) {
      expect(all).toContain(cls);
    }
  });

  it("collects static classes from .when() branches", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("button")
      .input(z.object({ variant: z.enum(["primary", "secondary"]).default("primary") }))
      .when("variant", {
        primary: (b) => b.bg("indigo-600").text_color("white"),
        secondary: (b) => b.bg("slate-200").text_color("slate-900"),
      });

    const all = p.getAllClasses();
    for (const cls of ["bg-indigo-600", "text-white", "bg-slate-200", "text-slate-900"]) {
      expect(all).toContain(cls);
    }
  });

  it("isolates registry from default pose export", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div").shadow_xl().overflow_hidden();
    const isolated = p.getAllClasses();
    expect(isolated).toContain("shadow-xl");
    expect(isolated).toContain("overflow-hidden");
  });

  it("getAllClasses() is stable across multiple calls", () => {
    const p = createPose({ presets: [tailwind4] });
    p.as("div").flex().p(4).rounded();
    expect(p.getAllClasses()).toEqual(p.getAllClasses());
  });
});
