# @poseui/form

Typed form binding via [Standard Schema](https://standardschema.dev). Attach a Zod, Valibot, or ArkType schema to any `<form>` element, get fully typed values on submission, and manage per-field error state — without owning your markup or dictating how errors are rendered.

Built on [`@poseui/on`](../on) for DOM event registration and teardown.

```ts
import { createForm } from "@poseui/form";
import { z } from "zod";

const form = createForm({
  target: "#signup",
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    age: z.coerce.number().min(18, "Must be 18 or older"),
  }),
  onSubmit(values) {
    // values.name  → string
    // values.email → string
    // values.age   → number  (coerced from the string FormData gives you)
    await api.signup(values);
  },
  onError(issues) {
    // issues is StandardSchemaV1.Issue[] — use form.errors() for the keyed map
    console.log(form.errors());
    // → { name: ["Name is required"], age: ["Must be 18 or older"] }
  },
});

const unmount = form.mount();

// later — removes all event listeners:
unmount();
```

## Install

```bash
bun add @poseui/form
bun add zod  # or valibot, arktype, any Standard Schema lib
```

## Core concepts

**`createForm(options)`** — creates a form binding. Nothing touches the DOM until `mount()` is called, so it's safe to define at module load time before your HTML exists.

**`target`** — the form element to bind to. Accepts a CSS selector string or a direct `HTMLFormElement` reference:

```ts
target: "#signup";
target: document.querySelector<HTMLFormElement>("#signup")!;
```

**`schema`** — any [Standard Schema](https://standardschema.dev) object schema. Schema transforms run before `onSubmit`, so `.trim()`, `.toUpperCase()`, `.default()` and similar all work as expected. For numeric fields use `z.coerce.number()` — `FormData` delivers everything as strings.

**`onSubmit(values, event)`** — called with fully typed output values only after successful validation. Never called if the schema rejects.

**`onError(issues, event)`** — called with the raw `StandardSchemaV1.Issue[]` when validation fails on submission. Optional — if omitted, failures are silently recorded in `form.errors()`.

**`validateOn`** — controls when schema validation runs automatically on field changes:

| Value                | Behaviour                                               |
| -------------------- | ------------------------------------------------------- |
| `"submit"` (default) | Validates only on form submission                       |
| `"change"`           | Validates after each field loses focus with a new value |
| `"input"`            | Validates on every keystroke                            |

Dirty tracking via `form.isDirty()` is always active regardless of `validateOn`.

**`root`** — optional root element to scope event registration to. Passed to `@poseui/on`'s `mount()`. Useful on pages with multiple forms or dynamically loaded sections. Defaults to `document`.

---

## API

### `form.values()`

Read and validate current form values synchronously. Returns a discriminated union — never throws:

```ts
const result = form.values();

if (result.ok) {
  console.log(result.data.email); // fully typed
} else {
  console.log(result.issues); // StandardSchemaV1.Issue[]
}
```

Useful for computing derived UI state with alien-signals or similar reactive primitives without triggering a submission.

### `form.errors()`

Per-field error state from the last validation attempt. Empty object before the first validation runs. Keys are dot-separated field paths; values are arrays of message strings so multiple failing rules on one field are all surfaced:

```ts
form.errors();
// → { "email": ["Invalid email"], "age": ["Must be at least 18"] }
```

Returns a copy — mutating the result has no effect on internal state.

### `form.isDirty()`

`true` if any field has fired a `change` event since `mount()` was called. Useful for enabling/disabling a submit button or showing an "unsaved changes" prompt.

### `form.submit()`

Programmatically trigger the full validate → `onSubmit` / `onError` cycle. Useful for submit buttons that live outside the `<form>` element, or for testing:

```ts
document.querySelector("#external-submit-btn")?.addEventListener("click", () => form.submit());
```

### `form.mount()`

Attach event listeners to the form element. Returns a cleanup function:

```ts
const unmount = form.mount();

// later:
unmount(); // equivalent to form.unmount()
```

Safe to call multiple times — each call produces an independent cleanup. The form element must exist in the DOM at mount time.

### `form.unmount()`

Remove all event listeners attached by the most recent `mount()` call. Idempotent — safe to call multiple times.

---

## Coercion and transforms

Everything that comes out of `FormData` is a string (or a `File`). For numeric and boolean fields, use your schema's coercion utilities:

```ts
z.object({
  age: z.coerce.number().min(18),
  count: z.coerce.number().int().nonnegative(),
  subscribed: z.string().transform((v) => v === "on"), // checkbox
});
```

Schema transforms — `.trim()`, `.toUpperCase()`, `.default()`, etc. — run before `onSubmit`, so `values` always reflects the transformed output, not the raw string from the DOM.

## Multiple same-name fields

Fields sharing a `name` (multi-select, checkboxes) are delivered as an array. Use `z.array(...)` in your schema to match:

```ts
// <input type="checkbox" name="roles" value="admin" />
// <input type="checkbox" name="roles" value="editor" />

z.object({
  roles: z.array(z.enum(["admin", "editor", "viewer"])),
});
```

Single-value fields are unwrapped from the array automatically, so you don't need `z.array(z.string())` for ordinary text inputs.

## Rendering errors

`@poseui/form` intentionally has no opinion about how errors are displayed. Read `form.errors()` and render them however you like:

```ts
// With alien-signals
import { signal, computed } from "alien-signals";

const errors = signal<FormErrors>({});

const form = createForm({
  target: "#signup",
  schema,
  onSubmit: handleSubmit,
  onError: () => errors.set(form.errors()),
  validateOn: "change",
});

// With pose
const errorMsg = pose
  .as("p")
  .input(z.object({ message: z.string() }))
  .text_sm()
  .text_color("red-600")
  .child(({ message }) => message);
```

## Dynamic content

Because `mount()` returns a cleanup function, wiring a form inside a dynamically loaded section is straightforward:

```ts
async function openModal() {
  document.body.insertAdjacentHTML("beforeend", await fetchModalHTML());

  const form = createForm({
    target: "#modal-form",
    schema: modalSchema,
    onSubmit: handleModalSubmit,
  });

  const unmount = form.mount();

  // Return teardown so the caller cleans up when the modal closes
  return () => {
    unmount();
    document.querySelector("#modal")?.remove();
  };
}
```

## License

MIT
