import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const badgeStory = defineStory({
  args: { variant: "primary" as const, child: "Badge" },
  component: pose.as("span").badge(),
});
