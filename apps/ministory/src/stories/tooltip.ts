import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const tooltipStory = defineStory({
  args: {
    tip: "Copy to clipboard",
    side: "bottom" as const,
    align: "start" as const,
    child: "📋",
  },
  component: pose.as("span").tooltip(),
});
