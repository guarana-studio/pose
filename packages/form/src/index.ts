// =============================================================================
// @poseui/form — typed form binding via Standard Schema
// Uses @poseui/on for DOM event registration and teardown.
// https://standardschema.dev
// =============================================================================

import { createEventMap } from "@poseui/on";

// ---------------------------------------------------------------------------
// Standard Schema v1 spec — copied inline, no runtime dep.
// ---------------------------------------------------------------------------

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  export interface Props<Input = unknown, Output = Input> {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
      options?: Options | undefined,
    ) => Result<Output> | Promise<Result<Output>>;
    readonly types?: Types<Input, Output> | undefined;
  }
  export type Result<Output> = SuccessResult<Output> | FailureResult;
  export interface SuccessResult<Output> {
    readonly value: Output;
    readonly issues?: undefined;
  }
  export interface Options {
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }
  export interface FailureResult {
    readonly issues: ReadonlyArray<Issue>;
  }
  export interface Issue {
    readonly message: string;
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  export interface PathSegment {
    readonly key: PropertyKey;
  }
  export interface Types<Input = unknown, Output = Input> {
    readonly input: Input;
    readonly output: Output;
  }
  export type InferInput<S extends StandardSchemaV1> = NonNullable<
    S["~standard"]["types"]
  >["input"];
  export type InferOutput<S extends StandardSchemaV1> = NonNullable<
    S["~standard"]["types"]
  >["output"];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Discriminated union result from reading or validating form values.
 * Never throws — validation failures are returned as data.
 */
export type FormResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ReadonlyArray<StandardSchemaV1.Issue> };

/**
 * Per-field error map. Keys are dot-separated field paths matching the
 * schema's issue path (e.g. `"user.email"`). Values are arrays of messages
 * so multiple failing rules on a single field are all surfaced.
 */
export type FormErrors = Record<string, string[]>;

/**
 * When to run schema validation automatically against field changes.
 *
 * - `"submit"` (default) — only on form submission
 * - `"change"` — on `change` events (after a field loses focus with a new value)
 * - `"input"` — on every `input` event (every keystroke)
 */
export type ValidateOn = "submit" | "change" | "input";

/**
 * The target form element — either a CSS selector string or a direct
 * `HTMLFormElement` reference obtained via `querySelector` etc.
 */
export type FormTarget = string | HTMLFormElement;

export interface CreateFormOptions<S extends StandardSchemaV1<any, any>> {
  /**
   * The form to bind to. Accepts a CSS selector string or an `HTMLFormElement`.
   *
   * @example
   * target: "#signup"
   * target: document.querySelector<HTMLFormElement>("#signup")!
   */
  target: FormTarget;

  /** Standard Schema — Zod, Valibot, ArkType, or any compatible library. */
  schema: S;

  /**
   * Called with fully typed output values after successful schema validation
   * on submission. Not called if validation fails.
   */
  onSubmit: (values: StandardSchemaV1.InferOutput<S>, event: SubmitEvent) => void;

  /**
   * Called with structured issues when schema validation fails on submission.
   */
  onError?: (issues: ReadonlyArray<StandardSchemaV1.Issue>, event: SubmitEvent) => void;

  /**
   * When to run validation automatically on field changes.
   * Defaults to `"submit"`.
   */
  validateOn?: ValidateOn;

  /**
   * Root element to scope event registration to.
   * Passed directly to `@poseui/on`'s `mount()`. Defaults to `document`.
   */
  root?: Element | Document;
}

export interface Form<S extends StandardSchemaV1<any, any>> {
  /**
   * Read and validate the current form values synchronously against the schema.
   * Returns a discriminated union — never throws.
   *
   * Useful for live reads outside of the submit cycle, e.g. computing
   * derived UI state with alien-signals.
   *
   * @example
   * const result = form.values();
   * if (result.ok) console.log(result.data.email);
   * else console.log(result.issues);
   */
  values(): FormResult<StandardSchemaV1.InferOutput<S>>;

  /**
   * The per-field error state from the last validation attempt.
   * Empty object before the first validation runs.
   *
   * Keys are dot-separated field paths. Values are arrays of error messages.
   *
   * @example
   * form.errors()
   * // → { "email": ["Invalid email"], "age": ["Must be at least 18"] }
   */
  errors(): FormErrors;

  /**
   * Whether any field value has changed since `mount()` was called.
   * Tracked via `change` events regardless of `validateOn`.
   */
  isDirty(): boolean;

  /**
   * Manually trigger the validate → onSubmit/onError cycle without a user
   * gesture. Useful for programmatic submission or submit buttons outside
   * the `<form>` element.
   */
  submit(): void;

  /**
   * Attach event listeners to the form and activate the binding.
   * Returns a cleanup function equivalent to calling `form.unmount()`.
   *
   * Safe to call multiple times — each call produces an independent cleanup.
   *
   * @example
   * const unmount = form.mount();
   * // later:
   * unmount();
   */
  mount(): () => void;

  /**
   * Remove all event listeners attached by the most recent `mount()` call.
   * Idempotent — safe to call multiple times.
   */
  unmount(): void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveTarget(target: FormTarget): HTMLFormElement | null {
  if (typeof target === "string") {
    return document.querySelector<HTMLFormElement>(target);
  }
  return target;
}

function extractFormData(form: HTMLFormElement): Record<string, unknown> {
  const data = new FormData(form);
  const result: Record<string, unknown> = {};

  for (const key of new Set(data.keys())) {
    const values = data.getAll(key);
    // Single value → unwrap for ergonomic schema definitions (`z.string()` not `z.array(z.string())`).
    // Multiple values (multi-select, same-name checkboxes) → keep as array.
    result[key] = values.length === 1 ? values[0] : values;
  }

  return result;
}

function runSchemaSync<S extends StandardSchemaV1<any, any>>(
  schema: S,
  data: unknown,
): FormResult<StandardSchemaV1.InferOutput<S>> {
  const result = schema["~standard"].validate(data);

  if (result instanceof Promise) {
    console.warn(
      "[@poseui/form] Schema validation returned a Promise. " +
        "@poseui/form is synchronous — use a schema with synchronous validation. " +
        "With Zod, avoid async refinements (.refine with async callbacks).",
    );
    return {
      ok: false,
      issues: [{ message: "Async schema validation is not supported in @poseui/form." }],
    };
  }

  if (result.issues !== undefined) {
    return { ok: false, issues: result.issues };
  }

  return {
    ok: true,
    data: (result as StandardSchemaV1.SuccessResult<StandardSchemaV1.InferOutput<S>>).value,
  };
}

function issuesToErrors(issues: ReadonlyArray<StandardSchemaV1.Issue>): FormErrors {
  const errors: FormErrors = {};

  for (const issue of issues) {
    const path =
      issue.path?.map((p) => (typeof p === "object" ? String(p.key) : String(p))).join(".") ?? "";

    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }

  return errors;
}

/**
 * Build a selector for all interactive field elements scoped to a form.
 * When the form has an `id` we use a descendant selector so @poseui/on
 * can find fields via `querySelectorAll`. When there's no id we fall back
 * to `form input` etc. and rely on the mount `root` being the form itself.
 */
function buildFieldSelector(formEl: HTMLFormElement): string {
  const scope = formEl.id ? `#${CSS.escape(formEl.id)}` : "form";
  return [`${scope} input`, `${scope} select`, `${scope} textarea`].join(", ");
}

/**
 * Derive a selector string from a `FormTarget`. Used to register the submit
 * listener via @poseui/on — which needs a CSS selector string, not an element.
 * For element targets we use the form's id if available, otherwise fall back
 * to registering the submit event via a synthetic selector on `form` elements.
 */
function targetToSelector(target: FormTarget, formEl: HTMLFormElement): string {
  if (typeof target === "string") return target;
  if (formEl.id) return `#${CSS.escape(formEl.id)}`;
  // No id and no selector — fall back to a unique attribute we set temporarily.
  // This is the one case where we touch the DOM slightly, but it's non-visual.
  const tempAttr = "data-poseui-form";
  formEl.setAttribute(tempAttr, "");
  return `[${tempAttr}]`;
}

// ---------------------------------------------------------------------------
// createForm
// ---------------------------------------------------------------------------

/**
 * Bind a Standard Schema to a form element. Wires up typed submission,
 * validation, and per-field error state via `@poseui/on`.
 *
 * @example
 * import { createForm } from "@poseui/form";
 * import { z } from "zod";
 *
 * const form = createForm({
 *   target: "#signup",
 *   schema: z.object({
 *     email: z.string().email(),
 *     name:  z.string().min(1),
 *     age:   z.coerce.number().min(18),
 *   }),
 *   onSubmit(values) {
 *     console.log(values.email, values.name, values.age); // fully typed
 *   },
 *   onError(issues) {
 *     console.log(issues); // StandardSchemaV1.Issue[]
 *   },
 *   validateOn: "change",
 * });
 *
 * const unmount = form.mount();
 *
 * // Read current values at any time without submitting:
 * const result = form.values();
 * if (result.ok) console.log(result.data);
 *
 * // Tear down when done:
 * unmount(); // or form.unmount()
 */
export function createForm<S extends StandardSchemaV1<any, any>>(
  options: CreateFormOptions<S>,
): Form<S> {
  const { target, schema, onSubmit, onError, validateOn = "submit", root } = options;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  let currentErrors: FormErrors = {};
  let dirty = false;
  let activeUnmount: (() => void) | null = null;

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  function getFormElement(): HTMLFormElement {
    const el = resolveTarget(target);
    if (!el) {
      throw new Error(
        `[@poseui/form] Form element not found: ${
          typeof target === "string" ? `"${target}"` : "<provided element>"
        }. Ensure the element exists in the DOM before calling mount().`,
      );
    }
    return el;
  }

  function readValues(): FormResult<StandardSchemaV1.InferOutput<S>> {
    const formEl = getFormElement();
    return runSchemaSync(schema, extractFormData(formEl));
  }

  function runSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const result = readValues();

    if (result.ok) {
      currentErrors = {};
      onSubmit(result.data, event);
    } else {
      currentErrors = issuesToErrors(result.issues);
      onError?.(result.issues, event);
    }
  }

  function runFieldValidation(): void {
    const result = readValues();
    currentErrors = result.ok ? {} : issuesToErrors(result.issues);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const form: Form<S> = {
    values(): FormResult<StandardSchemaV1.InferOutput<S>> {
      return readValues();
    },

    errors(): FormErrors {
      return { ...currentErrors };
    },

    isDirty(): boolean {
      return dirty;
    },

    submit(): void {
      const formEl = getFormElement();
      if (activeUnmount) {
        // Mounted — dispatch and let the registered listener handle it,
        // so the event also reaches any other listeners on the form.
        formEl.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
      } else {
        // Not mounted — run directly so .submit() still works without mount().
        const event = new SubmitEvent("submit", { bubbles: true, cancelable: true });
        runSubmit(event);
      }
    },

    mount(): () => void {
      const formEl = getFormElement();
      const formSelector = targetToSelector(target, formEl);
      const fieldSelector = buildFieldSelector(formEl);

      const events = createEventMap();

      // Submit — core handler, always registered
      events.target<HTMLFormElement>(formSelector).on("submit", (e) => runSubmit(e as SubmitEvent));

      // Dirty tracking — always active regardless of validateOn
      events
        .targets<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(fieldSelector)
        .on("change", () => {
          dirty = true;
        });

      // Live validation
      if (validateOn === "change") {
        events
          .targets<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(fieldSelector)
          .on("change", runFieldValidation);
      }

      if (validateOn === "input") {
        events
          .targets<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(fieldSelector)
          .on("input", runFieldValidation);
      }

      const unmountFn = events.mount(root);

      activeUnmount = () => {
        unmountFn();
        // Clean up the temporary attribute we may have set for selector-less elements
        formEl.removeAttribute("data-poseui-form");
        activeUnmount = null;
      };

      return activeUnmount;
    },

    unmount(): void {
      activeUnmount?.();
    },
  };

  return form;
}
