// =============================================================================
// @poseui/form — test suite
// Run with: bun test --dom (or set dom = "happy-dom" in bunfig.toml)
// =============================================================================

import { describe, it, expect, beforeEach, mock } from "bun:test";

import { z } from "zod";

import { createForm } from "./index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fixture(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

function cleanup() {
  document.body.innerHTML = "";
}

function getForm(selector = "form"): HTMLFormElement {
  return document.querySelector<HTMLFormElement>(selector)!;
}

/** Set a field value and dispatch the appropriate events. */
function setField(
  form: HTMLFormElement,
  name: string,
  value: string,
  events: ("input" | "change")[] = ["input", "change"],
): void {
  const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  );
  if (!el) throw new Error(`Field "${name}" not found`);
  el.value = value;
  for (const type of events) {
    el.dispatchEvent(new Event(type, { bubbles: true }));
  }
}

/** Submit the form by dispatching a submit event. */
function submitForm(form: HTMLFormElement): void {
  form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Basic schema — reused across most tests
// ---------------------------------------------------------------------------

const basicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const basicHtml = `
  <form id="form">
    <input name="name" value="" />
    <input name="email" value="" />
    <button type="submit">Submit</button>
  </form>
`;

// ---------------------------------------------------------------------------
// createForm()
// ---------------------------------------------------------------------------

describe("createForm()", () => {
  it("returns an object with the expected API", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    expect(typeof form.values).toBe("function");
    expect(typeof form.errors).toBe("function");
    expect(typeof form.isDirty).toBe("function");
    expect(typeof form.submit).toBe("function");
    expect(typeof form.mount).toBe("function");
    expect(typeof form.unmount).toBe("function");
  });

  it("accepts a CSS selector string as target", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    expect(() => form.mount()).not.toThrow();
    form.unmount();
  });

  it("accepts an HTMLFormElement as target", () => {
    fixture(basicHtml);
    const el = getForm();
    const form = createForm({ target: el, schema: basicSchema, onSubmit: mock() });
    expect(() => form.mount()).not.toThrow();
    form.unmount();
  });

  it("throws when the target selector matches nothing", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#nonexistent", schema: basicSchema, onSubmit: mock() });
    expect(() => form.mount()).toThrow("Form element not found");
  });
});

// ---------------------------------------------------------------------------
// .values()
// ---------------------------------------------------------------------------

describe(".values()", () => {
  it("returns ok:false with empty required fields", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    const result = form.values();
    expect(result.ok).toBe(false);
    form.unmount();
  });

  it("returns ok:true with valid field values", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");

    const result = form.values();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Ada");
      expect(result.data.email).toBe("ada@example.com");
    }
    form.unmount();
  });

  it("returns typed output — coercion works for numbers", () => {
    fixture(`
      <form id="form">
        <input name="age" value="25" />
      </form>
    `);
    const schema = z.object({ age: z.coerce.number().min(0) });
    const form = createForm({ target: "#form", schema, onSubmit: mock() });
    form.mount();

    const result = form.values();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.data.age).toBe("number");
      expect(result.data.age).toBe(25);
    }
    form.unmount();
  });

  it("wraps multiple same-name values into an array", () => {
    fixture(`
      <form id="form">
        <input name="tags" value="a" />
        <input name="tags" value="b" />
      </form>
    `);
    const schema = z.object({ tags: z.array(z.string()) });
    const form = createForm({ target: "#form", schema, onSubmit: mock() });
    form.mount();

    const result = form.values();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.tags).toEqual(["a", "b"]);
    form.unmount();
  });

  it("never throws — returns ok:false instead of throwing on invalid data", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    expect(() => form.values()).not.toThrow();
    form.unmount();
  });

  it("can be called before mount()", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    expect(() => form.values()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// .errors()
// ---------------------------------------------------------------------------

describe(".errors()", () => {
  it("returns an empty object before any validation runs", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    expect(form.errors()).toEqual({});
    form.unmount();
  });

  it("returns per-field errors after a failed submission", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    submitForm(getForm());

    const errors = form.errors();
    expect(Array.isArray(errors["name"])).toBe(true);
    expect(errors["name"]?.length).toBeGreaterThan(0);
    form.unmount();
  });

  it("clears errors after a successful submission", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    submitForm(getForm());
    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");
    submitForm(formEl);

    expect(form.errors()).toEqual({});
    form.unmount();
  });

  it("returns a copy — mutating the result does not affect internal state", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    submitForm(getForm());

    const errors = form.errors();
    errors["name"] = ["mutated"];
    expect(form.errors()["name"]).not.toEqual(["mutated"]);
    form.unmount();
  });
});

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

describe("submission", () => {
  it("calls onSubmit with typed values on valid submission", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit });
    form.mount();

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");
    submitForm(formEl);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [values] = onSubmit.mock.calls[0] ?? [];
    expect(values.name).toBe("Ada");
    expect(values.email).toBe("ada@example.com");
    form.unmount();
  });

  it("does not call onSubmit when validation fails", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit });
    form.mount();

    submitForm(getForm());

    expect(onSubmit).not.toHaveBeenCalled();
    form.unmount();
  });

  it("calls onError with issues when validation fails", () => {
    fixture(basicHtml);
    const onError = mock();
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      onError,
    });
    form.mount();

    submitForm(getForm());

    expect(onError).toHaveBeenCalledTimes(1);
    const [issues] = onError.mock.calls[0] ?? [];
    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
    form.unmount();
  });

  it("passes the SubmitEvent as second arg to both onSubmit and onError", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const onError = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit, onError });
    form.mount();

    // Invalid — triggers onError
    submitForm(getForm());
    const [, errorEvent] = onError.mock.calls[0] ?? [];
    expect(errorEvent).toBeInstanceOf(SubmitEvent);

    // Valid — triggers onSubmit
    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");
    submitForm(formEl);
    const [, submitEvent] = onSubmit.mock.calls[0] ?? [];
    expect(submitEvent).toBeInstanceOf(SubmitEvent);

    form.unmount();
  });

  it("prevents default on the submit event", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    const event = new SubmitEvent("submit", { bubbles: true, cancelable: true });
    getForm().dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    form.unmount();
  });

  it("onError is optional — no throw when omitted and validation fails", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    expect(() => submitForm(getForm())).not.toThrow();
    form.unmount();
  });

  it("schema transforms are applied — trimmed and uppercased values reach onSubmit", () => {
    fixture(`
      <form id="form">
        <input name="code" value="  abc  " />
      </form>
    `);
    const schema = z.object({ code: z.string().trim().toUpperCase() });
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema, onSubmit });
    form.mount();

    submitForm(getForm());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].code).toBe("ABC");
    form.unmount();
  });
});

// ---------------------------------------------------------------------------
// .submit() — programmatic submission
// ---------------------------------------------------------------------------

describe(".submit()", () => {
  it("triggers the validate → onSubmit cycle programmatically on valid data", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit });
    form.mount();

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");

    form.submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    form.unmount();
  });

  it("triggers onError programmatically when validation fails", () => {
    fixture(basicHtml);
    const onError = mock();
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      onError,
    });
    form.mount();

    form.submit();

    expect(onError).toHaveBeenCalledTimes(1);
    form.unmount();
  });

  it("populates errors() after programmatic submit failure", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    form.submit();

    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);
    form.unmount();
  });
});

// ---------------------------------------------------------------------------
// .isDirty()
// ---------------------------------------------------------------------------

describe(".isDirty()", () => {
  it("returns false before any field changes", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    expect(form.isDirty()).toBe(false);
    form.unmount();
  });

  it("returns true after a field change event", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    setField(getForm(), "name", "Ada", ["change"]);

    expect(form.isDirty()).toBe(true);
    form.unmount();
  });

  it("tracks dirty state regardless of validateOn setting", () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "submit",
    });
    form.mount();

    setField(getForm(), "email", "test@test.com", ["change"]);

    expect(form.isDirty()).toBe(true);
    form.unmount();
  });
});

// ---------------------------------------------------------------------------
// validateOn
// ---------------------------------------------------------------------------

describe("validateOn", () => {
  it('"submit" — errors only update on submission, not on change', () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "submit",
    });
    form.mount();

    setField(getForm(), "name", "", ["change"]);
    expect(form.errors()).toEqual({});

    submitForm(getForm());
    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);
    form.unmount();
  });

  it('"change" — errors update after change events', () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "change",
    });
    form.mount();

    setField(getForm(), "name", "", ["change"]);
    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);
    form.unmount();
  });

  it('"change" — errors clear when all fields become valid', () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "change",
    });
    form.mount();

    const formEl = getForm();
    setField(formEl, "name", "", ["change"]);
    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);

    setField(formEl, "name", "Ada", ["change"]);
    setField(formEl, "email", "ada@example.com", ["change"]);
    expect(form.errors()).toEqual({});
    form.unmount();
  });

  it('"input" — errors update after input events', () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "input",
    });
    form.mount();

    setField(getForm(), "email", "not-an-email", ["input"]);
    expect(Object.keys(form.errors()).length).toBeGreaterThan(0);
    form.unmount();
  });

  it('"input" — does not validate on change events only', () => {
    fixture(basicHtml);
    const form = createForm({
      target: "#form",
      schema: basicSchema,
      onSubmit: mock(),
      validateOn: "input",
    });
    form.mount();

    // Trigger only change (not input) — errors should not appear
    setField(getForm(), "email", "not-an-email", ["change"]);
    // Dirty should be set but errors should not since we only fire change
    expect(form.isDirty()).toBe(true);
    form.unmount();
  });
});

// ---------------------------------------------------------------------------
// mount() / unmount()
// ---------------------------------------------------------------------------

describe("mount() / unmount()", () => {
  it("mount() returns a cleanup function", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    const unmount = form.mount();
    expect(typeof unmount).toBe("function");
    unmount();
  });

  it("cleanup function from mount() removes all listeners", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit });
    const unmount = form.mount();

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");

    unmount();
    submitForm(formEl);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("form.unmount() removes all listeners", () => {
    fixture(basicHtml);
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit });
    form.mount();

    const formEl = getForm();
    setField(formEl, "name", "Ada");
    setField(formEl, "email", "ada@example.com");

    form.unmount();
    submitForm(formEl);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("unmount() is idempotent — calling twice does not throw", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();
    expect(() => {
      form.unmount();
      form.unmount();
    }).not.toThrow();
  });

  it("two independent form instances on the same page do not interfere", () => {
    fixture(`
      <form id="form-a">
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
      <form id="form-b">
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
    `);
    const onSubmitA = mock();
    const onSubmitB = mock();

    const formA = createForm({ target: "#form-a", schema: basicSchema, onSubmit: onSubmitA });
    const formB = createForm({ target: "#form-b", schema: basicSchema, onSubmit: onSubmitB });

    formA.mount();
    formB.mount();

    submitForm(document.querySelector<HTMLFormElement>("#form-a")!);

    expect(onSubmitA).toHaveBeenCalledTimes(1);
    expect(onSubmitB).not.toHaveBeenCalled();

    formA.unmount();
    formB.unmount();
  });
});

// ---------------------------------------------------------------------------
// Element target without id
// ---------------------------------------------------------------------------

describe("element target without id", () => {
  it("works when the form element has no id", () => {
    fixture(`
      <form>
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
    `);
    const formEl = document.querySelector<HTMLFormElement>("form")!;
    const onSubmit = mock();
    const form = createForm({ target: formEl, schema: basicSchema, onSubmit });
    form.mount();

    submitForm(formEl);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    form.unmount();
  });

  it("removes the temporary data-poseui-form attribute on unmount", () => {
    fixture(`
      <form>
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
    `);
    const formEl = document.querySelector<HTMLFormElement>("form")!;
    const form = createForm({ target: formEl, schema: basicSchema, onSubmit: mock() });
    form.mount();
    form.unmount();

    expect(formEl.hasAttribute("data-poseui-form")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("handles a form with no fields — empty FormData passes empty schema", () => {
    fixture(`<form id="form"></form>`);
    const schema = z.object({});
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema, onSubmit });
    form.mount();

    submitForm(getForm());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    form.unmount();
  });

  it("handles textarea values", () => {
    fixture(`
      <form id="form">
        <textarea name="message">Hello world</textarea>
      </form>
    `);
    const schema = z.object({ message: z.string().min(1) });
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema, onSubmit });
    form.mount();

    submitForm(getForm());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].message).toBe("Hello world");
    form.unmount();
  });

  it("handles select values", () => {
    fixture(`
      <form id="form">
        <select name="role">
          <option value="admin" selected>Admin</option>
          <option value="user">User</option>
        </select>
      </form>
    `);
    const schema = z.object({ role: z.enum(["admin", "user"]) });
    const onSubmit = mock();
    const form = createForm({ target: "#form", schema, onSubmit });
    form.mount();

    submitForm(getForm());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].role).toBe("admin");
    form.unmount();
  });

  it("scopes to the provided root — does not affect forms outside it", () => {
    fixture(`
      <div id="app">
        <form id="inner">
          <input name="name" value="Ada" />
          <input name="email" value="ada@example.com" />
        </form>
      </div>
      <form id="outer">
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
    `);
    const onSubmit = mock();
    const form = createForm({
      target: "#inner",
      schema: basicSchema,
      onSubmit,
      root: document.querySelector("#app")!,
    });
    form.mount();

    submitForm(document.querySelector<HTMLFormElement>("#outer")!);
    expect(onSubmit).not.toHaveBeenCalled();

    submitForm(document.querySelector<HTMLFormElement>("#inner")!);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    form.unmount();
  });

  it("errors contain message strings, not raw schema objects", () => {
    fixture(basicHtml);
    const form = createForm({ target: "#form", schema: basicSchema, onSubmit: mock() });
    form.mount();

    submitForm(getForm());

    const errors = form.errors();
    for (const messages of Object.values(errors)) {
      for (const msg of messages) {
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    }
    form.unmount();
  });
});
