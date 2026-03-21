import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const buttonStory = defineStory({
  args: {
    variant: "primary" as const,
    size: "md" as const,
    disabled: false,
    pressed: false,
    child: "Click me",
  },
  component: pose.as("button").btn(),
});
