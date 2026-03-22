import { pose } from "$lib/pose";
import { store } from "$lib/store";
import { z } from "zod";

export const app = pose
  .as("div")
  .input(z.object({ count: z.number().default(0) }))
  .child(
    ({ count }) =>
      `
      <span>${count}</span>
      <button id="incrementButton" class="bg-neutral-900 text-neutral-100 p-2">+</button>
    `,
  )
  .on("#incrementButton", "click", () => store.getState().increment())
  .handler(({ render }) => {
    const unsub = store.subscribe(
      (s) => s.count,
      (count) => render({ count }),
    );
    return unsub;
  });
