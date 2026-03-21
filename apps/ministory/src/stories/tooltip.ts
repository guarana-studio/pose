import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const tooltipStory = defineStory({
  args: {
    tip: "Copy to clipboard",
    side: "bottom",
    align: "start",
    child: "📋",
  },
  component: pose.as("span").tooltip(),
});
