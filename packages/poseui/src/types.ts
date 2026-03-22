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
// DelegatedEntry
//
// A delegated event listener registered via .on(). Stored on BuilderState and
// wired at mount time onto the stable root element so it survives render()
// calls that swap innerHTML.
// ---------------------------------------------------------------------------

export type DelegatedEntry = {
  selector: string;
  type: string;
  handler: (e: Event) => void;
};

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
// ---------------------------------------------------------------------------

export interface PoseElement<
  TProps extends Record<string, unknown>,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  TTag extends string = string,
> {
  (...args: CallArgs<TProps, TSchema>): RenderReturn<TSchema>;

  readonly classes: ReadonlyArray<ClassEntry<TProps>>;

  getClasses(props?: CallArgs<TProps, TSchema>[0]): string;

  input<S extends StandardSchemaV1<any, Record<string, unknown>>>(
    schema: S,
  ): PoseElement<StandardSchemaV1.InferOutput<S>, S, TTag>;

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

  attr<K extends AttrName<TTag>>(
    name: K,
    value: Dyn<TProps, AttrValueFor<TTag, K & string> | null>,
  ): PoseElement<TProps, TSchema, TTag>;

  attrs(
    record:
      | { [K in AttrName<TTag>]?: Dyn<TProps, AttrValueFor<TTag, K & string> | null> }
      | ((
          props: TProps,
        ) => Partial<Record<keyof AttrsFor<TTag>, AttrValue>> & Record<string, AttrValue>),
  ): PoseElement<TProps, TSchema, TTag>;

  cls(value: Dyn<TProps, string>): PoseElement<TProps, TSchema, TTag>;

  child(fn: (props: TProps) => ChildValue): PoseElement<TProps, TSchema, TTag>;
  child(value: ChildValue): PoseElement<TProps, TSchema, TTag>;

  /**
   * Register a delegated event listener scoped to a CSS selector.
   *
   * Stored on the builder and wired at mount time onto the stable root
   * element. Survives render() calls automatically because the root element
   * is never replaced — only its innerHTML is swapped.
   *
   * The selector is matched via .closest(), so clicks on child nodes inside
   * the target are handled correctly.
   *
   * @example
   * pose
   *   .as("div")
   *   .child(({ count }) => `
   *     <span>${count}</span>
   *     <button id="inc">+</button>
   *     <button id="dec">-</button>
   *   `)
   *   .on("#inc", "click", () => store.getState().increment())
   *   .on("#dec", "click", () => store.getState().decrement())
   *   .handler(({ render }) => {
   *     const unsub = store.subscribe((s) => s.count, (count) => render({ count }));
   *     return unsub;
   *   });
   */
  on<K extends keyof HTMLElementEventMap>(
    selector: string,
    type: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): PoseElement<TProps, TSchema, TTag>;

  /**
   * Close the builder into a mountable component.
   *
   * The handler optionally returns a teardown function. If returned, it is
   * called on unmount — after delegated listener cleanup and eventsCleanup
   * have run. Use it to unsubscribe from stores, cancel timers, or tear down
   * any other side effects set up inside the handler.
   *
   * @example
   * pose
   *   .as("div")
   *   .input(z.object({ count: z.number().default(0) }))
   *   .child(({ count }) => `<span>${count}</span><button id="inc">+</button>`)
   *   .on("#inc", "click", () => store.getState().increment())
   *   .handler(({ render }) => {
   *     const unsub = store.subscribe(
   *       (s) => s.count,
   *       (count) => render({ count }),
   *     );
   *     return unsub; // called when the component is unmounted
   *   });
   */
  handler<TEvents extends EventMap>(
    fn: (ctx: HandlerContext<TProps, TEvents>) => (() => void) | void,
  ): Component<TProps, TSchema, TEvents>;
}

// ---------------------------------------------------------------------------
// Component — returned by .handler(), mountable into the DOM
// ---------------------------------------------------------------------------

export interface EventMap {
  mount(root?: Element | Document): () => void;
}

export interface HandlerContext<TProps extends Record<string, unknown>, TEvents extends EventMap> {
  /** Schema-validated props for this render. */
  readonly input: TProps;
  /** The root DOM element this component was mounted into. */
  readonly el: Element;
  /** Event map instance passed in at mount time. */
  readonly events: TEvents;
  /**
   * Re-render the component with new props. Swaps el.innerHTML only —
   * delegated listeners registered via .on() and any subscriptions set up
   * in the handler stay alive across re-renders.
   */
  readonly render: (props?: Partial<TProps>) => void;
}

export interface Component<
  TProps extends Record<string, unknown>,
  TSchema extends StandardSchemaV1 | undefined = undefined,
  TEvents extends EventMap = EventMap,
> {
  (...args: CallArgs<TProps, TSchema>): RenderReturn<TSchema>;
  mount(el: Element, events: TEvents, ...args: CallArgs<TProps, TSchema>): () => void;
}

// ---------------------------------------------------------------------------
// Pose interface
// ---------------------------------------------------------------------------

export interface Pose {
  as<Tag extends keyof HTMLElementTagNameMap>(
    tag: Tag,
  ): PoseElement<Record<never, never>, undefined, Tag>;

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
  /** Delegated event listeners registered via .on(). Wired at mount time. */
  delegated: DelegatedEntry[];
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
