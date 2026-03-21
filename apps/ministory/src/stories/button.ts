import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const buttonStory = defineStory({
  args: { child: "Click me" },
  component: pose.as("button").btn(),
});
