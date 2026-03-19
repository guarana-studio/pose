import { button } from "../lib/components/button";
import { defineStory } from "../lib/utils";

export const buttonStory = defineStory({
  args: { text: "Click me" },
  component: button,
});
