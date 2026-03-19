import type { PoseElement } from "poseui";

type Story<TArgs extends Record<string, unknown>> = {
  args: TArgs;
  component: PoseElement<TArgs>;
};

export function defineStory<TArgs extends Record<string, unknown>>(
  story: Story<TArgs>,
): Story<TArgs> {
  return story;
}
