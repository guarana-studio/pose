import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const cardStory = defineStory({
  args: {
    title: "Card Title",
    desc: "Card description",
    child: "Card content goes here.",
    footer: "Footer content",
  },
  component: pose.as("div").card(),
});
