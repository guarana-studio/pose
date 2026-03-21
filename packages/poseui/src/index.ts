// =============================================================================
// poseui — core templating engine
// Zero dependencies. Fully synchronous.
// https://standardschema.dev
// =============================================================================

import { match } from "@poseui/match";

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
// Validation
// ---------------------------------------------------------------------------

export class PoseValidationError extends Error {
  readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    const summary = issues
      .map((i) => {
        const path = i.path?.map((p) => (typeof p === "object" ? p.key : p)).join(".");
        return path ? `${path}: ${i.message}` : i.message;
      })
      .join("; ");
    super(`Pose validation failed — ${summary}`);
    this.name = "PoseValidationError";
    this.issues = issues;
  }
}

function runSchema<S extends StandardSchemaV1>(
  schema: S,
  value: unknown,
): StandardSchemaV1.InferOutput<S> | Promise<StandardSchemaV1.InferOutput<S>> {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) {
    return result.then(unwrapResult) as Promise<StandardSchemaV1.InferOutput<S>>;
  }
  return unwrapResult(result) as StandardSchemaV1.InferOutput<S>;
}

function unwrapResult<O>(result: StandardSchemaV1.Result<O>): O {
  if (result.issues !== undefined) throw new PoseValidationError(result.issues);
  return (result as StandardSchemaV1.SuccessResult<O>).value;
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

type RenderReturn<TSchema extends StandardSchemaV1 | undefined> = TSchema extends StandardSchemaV1
  ? ReturnType<TSchema["~standard"]["validate"]> extends Promise<any>
    ? Promise<string>
    : string
  : string;

type CallArgs<TProps extends Record<string, unknown>, TSchema> = [TSchema] extends [
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

function resolveClasses<TProps>(classes: ReadonlyArray<ClassEntry<TProps>>, props: TProps): string {
  return classes
    .map((c) => (typeof c === "function" ? c(props) : c))
    .filter(Boolean)
    .join(" ");
}

function renderAttrPair(name: string, value: AttrValue): string {
  if (value === null) return "";
  return value === "" ? name : `${name}="${value}"`;
}

function resolveAttrs<TProps>(attrs: AttrEntry<TProps>[], props: TProps): string {
  const parts: string[] = [];
  for (const entry of attrs) {
    if (entry[0] === "single") {
      const [, name, value] = entry;
      const resolved = typeof value === "function" ? value(props) : value;
      const rendered = renderAttrPair(name, resolved);
      if (rendered) parts.push(rendered);
    } else {
      const [, fn] = entry;
      for (const [name, value] of Object.entries(fn(props))) {
        const rendered = renderAttrPair(name, value);
        if (rendered) parts.push(rendered);
      }
    }
  }
  return parts.join(" ");
}

function renderChild(child: unknown, props: Record<string, unknown>): string {
  if (typeof child === "function") return renderChild((child as Function)(props), props);
  if (Array.isArray(child))
    return child
      .filter((c) => c != null)
      .map((c) => renderChild(c, props))
      .join("");
  if (child != null && typeof child === "object" && "__pose" in child) {
    return (child as (p: Record<string, unknown>) => string)(props);
  }
  return child == null ? "" : String(child);
}

function createBlankBuilder<TProps extends Record<string, unknown>>(
  presets: Preset<PoseElement<any, any, any>>[],
  tag: string = "div",
): PoseElement<TProps, undefined, string> {
  return createBuilder<TProps, undefined, string>({
    tag,
    classes: [],
    attrs: [],
    children: [],
    schema: undefined,
    registry: undefined,
    presets,
  });
}

export function createBuilder<
  TProps extends Record<string, unknown>,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  TTag extends string = string,
>(state: BuilderState<TProps>): PoseElement<TProps, TSchema, TTag> {
  if (state.registry) {
    for (const c of state.classes) state.registry.add(c as ClassEntry<unknown>);
  }

  function derive(
    extraClasses: ClassEntry<TProps>[] = [],
    extraChildren: Child<TProps>[] = [],
    extraAttrs: AttrEntry<TProps>[] = [],
  ): PoseElement<TProps, TSchema, TTag> {
    if (state.registry) {
      for (const c of extraClasses) state.registry.add(c as ClassEntry<unknown>);
    }
    return createBuilder<TProps, TSchema, TTag>({
      ...state,
      classes: [...state.classes, ...extraClasses],
      attrs: [...state.attrs, ...extraAttrs],
      children: [...state.children, ...extraChildren],
    });
  }

  function cls(name: string): PoseElement<TProps, TSchema, TTag> {
    return derive([name]);
  }

  function dynCls<T>(
    raw: Dyn<TProps, T>,
    map: (v: T) => string,
  ): PoseElement<TProps, TSchema, TTag> {
    if (typeof raw === "function") {
      const fn = raw as (p: TProps) => T;
      return derive([(props: TProps) => map(fn(props))]);
    }
    return derive([map(raw as T)]);
  }

  function buildHtml(resolvedProps: TProps): string {
    const classStr = resolveClasses(state.classes, resolvedProps);
    const attrsStr = resolveAttrs(state.attrs, resolvedProps);
    const childrenStr = state.children
      .map((c) => renderChild(c, resolvedProps as Record<string, unknown>))
      .join("");
    const classAttr = classStr ? ` class="${classStr}"` : "";
    const attrsAttr = attrsStr ? ` ${attrsStr}` : "";
    return `<${state.tag}${classAttr}${attrsAttr}>${childrenStr}</${state.tag}>`;
  }

  function render(...args: CallArgs<TProps, TSchema>): any {
    const props = (args[0] ?? {}) as TProps;
    if (!state.schema) return buildHtml(props);
    const result = runSchema(state.schema, props);
    if (result instanceof Promise) return result.then((v) => buildHtml(v as TProps));
    return buildHtml(result as TProps);
  }

  (render as any).__pose = true;
  (render as any).__state = state;

  const el = render as PoseElement<TProps, TSchema, TTag>;

  Object.defineProperty(el, "classes", { get: () => state.classes, enumerable: true });

  el.getClasses = (props?: any): string => resolveClasses(state.classes, (props ?? {}) as TProps);

  el.input = <S extends StandardSchemaV1<any, Record<string, unknown>>>(schema: S) =>
    createBuilder<StandardSchemaV1.InferOutput<S>, S, TTag>({
      tag: state.tag,
      classes: state.classes as unknown as ClassEntry<StandardSchemaV1.InferOutput<S>>[],
      attrs: state.attrs as unknown as AttrEntry<StandardSchemaV1.InferOutput<S>>[],
      children: state.children as unknown as Child<StandardSchemaV1.InferOutput<S>>[],
      schema,
      registry: state.registry,
      presets: state.presets,
    });

  // .when() — powered by @poseui/match

  function applyBranch(
    getBranch: (props: TProps) => PoseElement<TProps, undefined, TTag> | null,
  ): PoseElement<TProps, TSchema, TTag> {
    const classEntry: ClassEntry<TProps> = (props) => {
      const branch = getBranch(props);
      return branch ? resolveClasses(branch.classes, props) : "";
    };

    const childEntry: Child<TProps> = (props: TProps) => {
      const branch = getBranch(props);
      if (!branch) return null;
      const branchState = (branch as any).__state as BuilderState<TProps>;
      if (!branchState.children.length) return null;
      return branchState.children.map((c) =>
        typeof c === "function" ? c(props) : c,
      ) as ChildValue;
    };

    return derive([classEntry], [childEntry]);
  }

  el.when = (...args: any[]): any => {
    if (typeof args[0] === "function") {
      const [pred, apply] = args as [
        (props: TProps) => boolean,
        (b: PoseElement<TProps, undefined, TTag>) => PoseElement<TProps, any, TTag>,
      ];

      const blank = createBlankBuilder<TProps>(state.presets, state.tag) as PoseElement<
        TProps,
        undefined,
        TTag
      >;
      const previewBranch = apply(blank);
      for (const c of previewBranch.classes) {
        if (typeof c === "string" && state.registry) state.registry.add(c);
      }

      return applyBranch(
        (props) =>
          match<Record<string, unknown>, PoseElement<TProps, undefined, TTag>>(
            props as Record<string, unknown>,
          )
            .when(pred as (v: Record<string, unknown>) => boolean, () =>
              apply(
                createBlankBuilder<TProps>(state.presets, state.tag) as PoseElement<
                  TProps,
                  undefined,
                  TTag
                >,
              ),
            )
            .first() ?? null,
      );
    }

    const [key, cases] = args as [
      keyof TProps,
      Record<
        PropertyKey,
        (b: PoseElement<TProps, undefined, TTag>) => PoseElement<TProps, any, TTag>
      >,
    ];

    for (const branchFn of Object.values(cases)) {
      const blank = createBlankBuilder<TProps>(state.presets, state.tag) as PoseElement<
        TProps,
        undefined,
        TTag
      >;
      const previewBranch = branchFn(blank);
      for (const c of previewBranch.classes) {
        if (typeof c === "string" && state.registry) state.registry.add(c);
      }
    }

    return applyBranch((props) => {
      const branchFn = cases[props[key] as PropertyKey];
      return branchFn
        ? branchFn(
            createBlankBuilder<TProps>(state.presets, state.tag) as PoseElement<
              TProps,
              undefined,
              TTag
            >,
          )
        : null;
    });
  };

  // .attr() — name constrained to AttrName<TTag>, value to AttrValueFor<TTag, K>

  el.attr = (name: any, value: any) =>
    derive([], [], [["single", name, value as string | ((p: TProps) => AttrValue)]]);

  // .attrs() — record keys constrained to AttrName<TTag>

  el.attrs = (recordOrFn: any) => {
    if (typeof recordOrFn === "function") {
      return derive([], [], [["record", recordOrFn as (p: TProps) => Record<string, AttrValue>]]);
    }
    const entries: AttrEntry<TProps>[] = Object.entries(recordOrFn).map(([name, value]) => [
      "single",
      name,
      value as string | ((p: TProps) => AttrValue),
    ]);
    return derive([], [], entries);
  };

  // .cls()

  el.cls = (value) => derive([value as ClassEntry<TProps>]);

  // .child()

  el.child = (value: any) =>
    createBuilder<TProps, TSchema, TTag>({
      ...state,
      classes: [...state.classes],
      attrs: [...state.attrs],
      children: [...state.children, value],
      registry: state.registry,
      presets: state.presets,
    });

  // Apply presets

  const presetHelpers = {
    cls: (name: string) => cls(name),
    dynCls: <T>(raw: Dyn<Record<string, unknown>, T>, map: (v: T) => string) =>
      dynCls(raw as Dyn<TProps, T>, map),
  };

  for (const preset of state.presets) {
    preset.extend(el, presetHelpers);
  }

  return el;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CreatePoseOptions {
  presets?: Preset<PoseElement<any, any, any>>[];
}

export function createPose(options: CreatePoseOptions = {}): Pose {
  const { presets = [] } = options;
  const registry = new Set<ClassEntry<unknown>>();

  return {
    as<Tag extends keyof HTMLElementTagNameMap>(tag: Tag) {
      return createBuilder<Record<never, never>, undefined, Tag>({
        tag,
        classes: [],
        attrs: [],
        children: [],
        schema: undefined,
        registry,
        presets,
      });
    },
    getAllClasses(): string {
      const seen = new Set<string>();
      for (const entry of registry) {
        if (typeof entry === "string" && entry) seen.add(entry);
      }
      return [...seen].join(" ");
    },
  };
}

/** Default pose instance — no presets. Use createPose({ presets }) for utility methods. */
const pose: Pose = createPose();

export const div = pose.as("div");

export default pose;
