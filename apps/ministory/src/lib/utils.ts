import type { PoseElement } from "poseui";

export type Story<TArgs extends Record<string, unknown>> = {
  args: TArgs;
  component: PoseElement<TArgs>;
};

// Loose story type for the registry - component accepts any args
export type AnyStory = {
  args: Record<string, unknown>;
  component: PoseElement<Record<string, unknown>>;
};

export function defineStory<TArgs extends Record<string, unknown>>(story: Story<TArgs>): AnyStory {
  return story as unknown as AnyStory;
}
