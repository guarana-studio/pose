# Pose

> ⚠️ Prototype — API is unstable

Type-safe HTML templating engine with a fluent Tailwind-compatible builder API. Inspired by [gpui](https://www.gpui.rs/).

Zero dependencies. Fully synchronous. Emits HTML with utility class names — CSS generation is your pipeline's concern.

```ts
import pose from "poseui";
import { z } from "zod";

const button = pose
  .as("button")
  .input(
    z.object({
      variant: z.enum(["primary", "secondary"]).default("primary"),
      disabled: z.boolean().default(false),
    }),
  )
  .px(4)
  .py(2)
  .rounded()
  .font_semibold()
  .transition()
  .when("variant", {
    primary: (b) => b.bg("indigo-600").text_color("white"),
    secondary: (b) => b.bg("slate-200").text_color("slate-900"),
  })
  .when(
    ({ disabled }) => disabled,
    (b) => b.opacity(50).cursor_not_allowed(),
  )
  .child(({ variant }) => (variant === "primary" ? "Submit" : "Cancel"));

button({ variant: "primary" });
// → <button class="px-4 py-2 rounded font-semibold transition bg-indigo-600 text-white">Submit</button>

button({ variant: "secondary", disabled: true });
// → <button class="px-4 py-2 rounded font-semibold transition bg-slate-200 text-slate-900 opacity-50 cursor-not-allowed">Cancel</button>
```

## Install

```bash
bun add poseui
bun add zod  # or valibot, arktype, any Standard Schema lib
```

## CSS

Pose emits standard Tailwind-compatible class names and nothing else. Plug in whatever you already use:

```bash
# Tailwind v4
npx @tailwindcss/cli -i input.css -o output.css

# UnoCSS
npx unocss "**/*.ts" -o output.css
```

Because the HTML is plain strings, both tools pick up classes the same way they would from any other source file.

## Core concepts

**`pose.as(tag)`** — start a builder for any HTML element tag.

**`.input(schema)`** — bind a [Standard Schema](https://standardschema.dev) object schema. Infers `TProps` from the output type so `.default()` transforms work. Validates on every call and throws `PoseValidationError` on failure.

**Style methods** — cover the full Tailwind utility surface: layout, spacing, typography, colour, borders, shadows, transforms, filters, animation, and more. Every method that takes a value also accepts `(props: TProps) => value` for dynamic styles. See the source for the complete list.

**`.when(pred, apply)`** — apply styles when a predicate returns true:

```ts
.when(({ disabled }) => disabled, (b) => b.opacity(50).cursor_not_allowed())
```

**`.when(key, cases)`** — switch on a prop key and apply styles per matching case. Case keys are typed to the prop's actual union — typos are compile errors:

```ts
.when("size", {
  sm: (b) => b.px(2).py(1).text_sm(),
  md: (b) => b.px(4).py(2).text_base(),
  lg: (b) => b.px(6).py(3).text_lg(),
})
```

Cases are `Partial` — unmatched values emit nothing. Multiple `.when()` calls stack independently and are all evaluated at render time.

**`.attr(name, value)`** — set a single HTML attribute. Value can be static or `(props) => string | null`. `null` omits the attribute entirely; `""` renders it as a boolean attribute (`required`, `disabled`, etc.):

```ts
pose
  .as("a")
  .input(z.object({ url: z.string(), external: z.boolean() }))
  .attr("href", ({ url }) => url)
  .attr("target", ({ external }) => (external ? "_blank" : null))
  .attr("rel", ({ external }) => (external ? "noopener noreferrer" : null));
```

**`.attrs(record | fn)`** — set multiple attributes at once. Accepts a record of static/dynamic values, or a `(props) => Record<string, string | null>` function for when attributes depend on each other:

```ts
// record form
pose.as("input").attrs({
  type: "text",
  name: ({ field }) => field,
  required: ({ required }) => (required ? "" : null),
});

// function form
pose.as("a").attrs(({ url, external }) => ({
  href: url,
  target: external ? "_blank" : null,
  rel: external ? "noopener noreferrer" : null,
}));
```

**`.cls(value)`** — escape hatch for anything not covered by the builder. Accepts a raw class string or `(props) => string`:

```ts
pose
  .as("div")
  .cls("hover:opacity-75")
  .cls(({ active }) => (active ? "ring-2 ring-blue-500" : ""));
```

**`.child(value | fn)`** — append children. Accepts a string, number, another `PoseElement`, an array of those, or `(props) => any of the above`. Chainable — call it multiple times to append in order.

**`element(props)`** — render to an HTML string. Synchronous unless the bound schema uses async validation, in which case it returns `Promise<string>`.

## Composition

`PoseElement` instances are valid children of other elements:

```ts
const avatar = pose.as("img").rounded_full().w(8).h(8);

const card = pose
  .as("div")
  .p(4)
  .rounded()
  .shadow_md()
  .child(avatar)
  .child(pose.as("p").text_sm().child("Hello"));

card();
// → <div class="p-4 rounded shadow-md"><img class="rounded-full w-8 h-8"></img><p class="text-sm">Hello</p></div>
```

## Validation errors

```ts
import { PoseValidationError } from "poseui";

try {
  button({ variant: "oops" });
} catch (err) {
  if (err instanceof PoseValidationError) {
    console.log(err.issues); // StandardSchemaV1.Issue[]
  }
}
```

## License

MIT
