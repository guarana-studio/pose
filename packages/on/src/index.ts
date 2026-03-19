// =============================================================================
// @poseui/on — typed DOM event registration
// Zero dependencies. Works against any DOM — no pose required.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventMapFor<T extends Element> = T extends HTMLElement
  ? HTMLElementEventMap
  : T extends SVGElement
    ? SVGElementEventMap
    : ElementEventMap;

type ListenerFn<T extends Element, K extends keyof EventMapFor<T>> = (
  event: EventMapFor<T>[K] & { currentTarget: T },
) => void;

type Registration<T extends Element> = {
  type: string;
  listener: ListenerFn<T, any>;
};

// ---------------------------------------------------------------------------
// TargetHandle
// ---------------------------------------------------------------------------

/**
 * A typed handle for a CSS selector. Accumulates listeners before the DOM is
 * queried. Nothing touches the DOM until `eventMap.mount()` is called.
 */
export interface TargetHandle<T extends Element> {
  /**
   * Register a typed event listener on this target.
   *
   * @example
   * events.target<HTMLButtonElement>("#submit")
   *   .on("click", (e) => {
   *     e.currentTarget.disabled = true; // e.currentTarget is HTMLButtonElement
   *   });
   */
  on<K extends keyof EventMapFor<T>>(type: K, listener: ListenerFn<T, K>): TargetHandle<T>;

  /**
   * Remove a previously registered listener before mount, or between
   * unmount/remount cycles.
   */
  off<K extends keyof EventMapFor<T>>(type: K, listener: ListenerFn<T, K>): TargetHandle<T>;
}

// ---------------------------------------------------------------------------
// EventMap
// ---------------------------------------------------------------------------

export interface EventMap {
  /**
   * Register a single-element target by CSS selector and element type.
   * Uses `querySelector` — matches the first element in the mount root.
   *
   * @example
   * events.target<HTMLButtonElement>("#submit").on("click", handler);
   */
  target<T extends Element>(selector: string): TargetHandle<T>;

  /**
   * Register a multi-element target by CSS selector and element type.
   * Uses `querySelectorAll` — matches all elements in the mount root.
   *
   * @example
   * events.targets<HTMLTableRowElement>("tbody tr").on("mouseenter", handler);
   */
  targets<T extends Element>(selector: string): TargetHandle<T>;

  /**
   * Query all registered selectors within `root`, attach every accumulated
   * listener, and return a cleanup function that removes them all.
   *
   * Safe to call before the DOM exists — all registration is deferred to
   * this point. Defaults to `document` if no root is provided.
   *
   * @example
   * const unmount = events.mount(document.querySelector("#app"));
   * // later:
   * unmount();
   */
  mount(root?: Element | Document): () => void;
}

// ---------------------------------------------------------------------------
// Internal entry shape
// ---------------------------------------------------------------------------

type TargetEntry = {
  selector: string;
  multi: boolean;
  registrations: Registration<any>[];
};

// ---------------------------------------------------------------------------
// createTargetHandle
// ---------------------------------------------------------------------------

function createTargetHandle<T extends Element>(entry: TargetEntry): TargetHandle<T> {
  const handle: TargetHandle<T> = {
    on(type, listener) {
      entry.registrations.push({ type: type as string, listener });
      return handle;
    },
    off(type, listener) {
      const idx = entry.registrations.findIndex(
        (r) => r.type === (type as string) && r.listener === listener,
      );
      if (idx !== -1) entry.registrations.splice(idx, 1);
      return handle;
    },
  };
  return handle;
}

// ---------------------------------------------------------------------------
// createEventMap
// ---------------------------------------------------------------------------

/**
 * Create an isolated event registration instance. Each instance maintains
 * its own registry — no global state, no shared side effects between instances.
 *
 * @example
 * const events = createEventMap();
 *
 * events.target<HTMLButtonElement>("#submit")
 *   .on("click", (e) => e.currentTarget.disabled = true);
 *
 * events.target<HTMLInputElement>(".search")
 *   .on("input", (e) => console.log(e.currentTarget.value));
 *
 * const unmount = events.mount(document.querySelector("#app"));
 *
 * // later, on navigation or teardown:
 * unmount();
 */
export function createEventMap(): EventMap {
  const entries: TargetEntry[] = [];

  function registerTarget<T extends Element>(selector: string, multi: boolean): TargetHandle<T> {
    const entry: TargetEntry = { selector, multi, registrations: [] };
    entries.push(entry);
    return createTargetHandle<T>(entry);
  }

  return {
    target<T extends Element>(selector: string): TargetHandle<T> {
      return registerTarget<T>(selector, false);
    },

    targets<T extends Element>(selector: string): TargetHandle<T> {
      return registerTarget<T>(selector, true);
    },

    mount(root: Element | Document = document): () => void {
      // Track every attached listener so we can remove them precisely
      const attached: Array<{
        el: Element;
        type: string;
        fn: EventListener;
      }> = [];

      for (const entry of entries) {
        if (entry.registrations.length === 0) continue;

        const elements: Element[] = entry.multi
          ? Array.from(root.querySelectorAll(entry.selector))
          : (() => {
              const el = root.querySelector(entry.selector);
              return el ? [el] : [];
            })();

        for (const el of elements) {
          for (const { type, listener } of entry.registrations) {
            // Cast through EventListener since we've already enforced types
            // via the generic TargetHandle — no user-facing casts needed.
            const fn = listener as EventListener;
            el.addEventListener(type, fn);
            attached.push({ el, type, fn });
          }
        }
      }

      return function unmount() {
        for (const { el, type, fn } of attached) {
          el.removeEventListener(type, fn);
        }
        attached.length = 0;
      };
    },
  };
}
