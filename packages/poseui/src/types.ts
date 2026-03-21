// =============================================================================
// poseui — public types
// Zero runtime code. Import with `import type` where possible.
// https://standardschema.dev
// =============================================================================

import type { AttrName, AttrValueFor, AttrsFor } from "./attrs";

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
// Core types
// ---------------------------------------------------------------------------

export type Dyn<TProps, T> = T | ((props: TProps) => T);

export type ChildValue =
  | string
  | number
  | undefined
  | null
  | PoseElement<any, any, any>
  | Array<string | number | PoseElement<any, any, any> | undefined | null>;

export type Child<TProps> = ChildValue | ((props: TProps) => ChildValue);

export type RenderReturn<TSchema extends StandardSchemaV1 | undefined> =
  TSchema extends StandardSchemaV1
    ? ReturnType<TSchema["~standard"]["validate"]> extends Promise<any>
      ? Promise<string>
      : string
    : string;

export type CallArgs<TProps extends Record<string, unknown>, TSchema> = [TSchema] extends [
  StandardSchemaV1,
]
  ? [Partial<TProps>?]
  : [keyof TProps] extends [never]
    ? [TProps?]
    : [TProps];

export type ClassEntry<TProps> = string | ((props: TProps) => string);

/** null means the attribute is omitted from the rendered output */
export type AttrValue = string | null;
export type AttrRecord<TProps> = Record<string, Dyn<TProps, AttrValue>>;
export type AttrEntry<TProps> =
  | [kind: "single", name: string, value: string | ((props: TProps) => AttrValue)]
  | [kind: "record", fn: (props: TProps) => Record<string, AttrValue>];

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

export interface Preset<TElement> {
  readonly name: string;
  extend(
    element: TElement,
    helpers: {
      cls(name: string): TElement;
      dynCls<T>(raw: Dyn<Record<string, unknown>, T>, map: (v: T) => string): TElement;
    },
  ): void;
}

// ---------------------------------------------------------------------------
// PoseElement
//
// Three type parameters:
//   TProps — the props object shape (inferred from .input() schema)
//   TSchema — the bound schema, or undefined
//   TTag — the HTML tag name (from .as("button") etc.), carried through the
//           entire chain so .attr() and .attrs() can infer valid names/values.
// ---------------------------------------------------------------------------

export interface PoseElement<
  TProps extends Record<string, unknown>,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  TTag extends string = string,
> {
  (...args: CallArgs<TProps, TSchema>): RenderReturn<TSchema>;

  readonly classes: ReadonlyArray<ClassEntry<TProps>>;

  /**
   * Returns the resolved class string without rendering a full HTML string.
   * Useful for testing and CSS pipeline inspection.
   *
   * @example
   * button.getClasses({ variant: "primary" })
   * // → "px-4 py-2 rounded bg-indigo-600 text-white"
   */
  getClasses(props?: CallArgs<TProps, TSchema>[0]): string;

  /**
   * Bind a Standard Schema (Zod, Valibot, ArkType, …).
   * Infers TProps from the schema output type; validates on every render.
   */
  input<S extends StandardSchemaV1<any, Record<string, unknown>>>(
    schema: S,
  ): PoseElement<StandardSchemaV1.InferOutput<S>, S, TTag>;

  /**
   * Apply styles conditionally — predicate form or value-switch form.
   *
   * Predicate form (apply when true):
   * ```ts
   * .when(({ disabled }) => disabled, (b) => b.opacity(50).cursor_not_allowed())
   * ```
   *
   * Value form (switch on a prop key):
   * ```ts
   * .when("variant", {
   *   primary:   (b) => b.bg("indigo-600").text_color("white"),
   *   secondary: (b) => b.bg("slate-200").text_color("slate-900"),
   * })
   * ```
   */
  when<TWhenTag extends string>(
    pred: (props: TProps) => boolean,
    apply: (b: PoseElement<TProps, undefined, TWhenTag>) => PoseElement<TProps, any, TWhenTag>,
  ): PoseElement<TProps, TSchema, TTag>;
  when<K extends keyof TProps, TWhenTag extends string>(
    key: K,
    cases: Partial<
      Record<
        TProps[K] & PropertyKey,
        (b: PoseElement<TProps, undefined, TWhenTag>) => PoseElement<TProps, any, TWhenTag>
      >
    >,
  ): PoseElement<TProps, TSchema, TTag>;

  /**
   * Set a single HTML attribute. The attribute name is constrained to valid
   * attributes for this element, and the value type is inferred from the
   * attribute definition.
   *
   * `null` omits the attribute. `""` renders as a boolean attribute
   * (`disabled=""`, `required=""`, etc.).
   *
   * Arbitrary `data-*` and `aria-*` attributes are always accepted.
   *
   * @example
   * pose.as("a").attr("href", "/home").attr("target", "_blank")
   * pose.as("input").attr("type", "email").attr("required", "")
   * pose.as("input").attr("type", "emal")    // ✗ TS error — invalid type value
   * pose.as("button").attr("href", "/home")  // ✗ TS error — href not valid on button
   */
  attr<K extends AttrName<TTag>>(
    name: K,
    value: Dyn<TProps, AttrValueFor<TTag, K & string> | null>,
  ): PoseElement<TProps, TSchema, TTag>;

  /**
   * Set multiple HTML attributes at once. Each key is constrained to valid
   * attribute names for this element with inferred value types.
   *
   * Also accepts a props function for fully dynamic attributes.
   *
   * @example
   * pose.as("input").attrs({ type: "email", required: "", placeholder: "Email" })
   * pose.as("a").attrs(({ url, external }) => ({
   *   href: url,
   *   target: external ? "_blank" : null,
   * }))
   */
  attrs(
    record:
      | { [K in AttrName<TTag>]?: Dyn<TProps, AttrValueFor<TTag, K & string> | null> }
      | ((
          props: TProps,
        ) => Partial<Record<keyof AttrsFor<TTag>, AttrValue>> & Record<string, AttrValue>),
  ): PoseElement<TProps, TSchema, TTag>;

  /**
   * Append a raw class string or dynamic class function.
   *
   * @example
   * .cls("hover:opacity-75")
   * .cls(({ active }) => active ? "ring-2 ring-blue-500" : "")
   */
  cls(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

  child(fn: (props: TProps) => ChildValue): PoseElement<TProps, TSchema, TTag>;
  child(value: ChildValue): PoseElement<TProps, TSchema, TTag>;
}

// ---------------------------------------------------------------------------
// Pose interface
// ---------------------------------------------------------------------------

export interface Pose {
  /**
   * Begin building a typed HTML element. The tag name flows through the chain
   * as `TTag`, enabling `.attr()` and `.attrs()` to infer valid attribute
   * names and their accepted value types for this specific element.
   *
   * @example
   * pose.as("input").attr("type", "email")  // autocompletes input type values
   * pose.as("a").attr("href", "/home")      // autocompletes anchor attrs
   * pose.as("button").attr("href", "/x")   // TS error — href invalid on button
   */
  as<Tag extends keyof HTMLElementTagNameMap>(
    tag: Tag,
  ): PoseElement<Record<never, never>, undefined, Tag>;

  /**
   * Returns a deduplicated, space-separated string of every static class name
   * registered across all elements created from this pose instance.
   * Feed to Tailwind CLI or UnoCSS as a virtual source file.
   */
  getAllClasses(): string;
}

// ---------------------------------------------------------------------------
// Builder internals
// ---------------------------------------------------------------------------

export interface BuilderState<TProps extends Record<string, unknown>> {
  tag: string;
  classes: ClassEntry<TProps>[];
  attrs: AttrEntry<TProps>[];
  children: Child<TProps>[];
  schema: StandardSchemaV1 | undefined;
  registry: Set<ClassEntry<unknown>> | undefined;
  presets: Preset<PoseElement<any, any, any>>[];
}

// ---------------------------------------------------------------------------
// createPose options
// ---------------------------------------------------------------------------

export interface CreatePoseOptions {
  presets?: Preset<PoseElement<any, any, any>>[];
}
