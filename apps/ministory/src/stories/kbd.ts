import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const kbdStory = defineStory({
  args: { child: "⌘K" },
  component: pose.as("kbd").kbd(),
});
