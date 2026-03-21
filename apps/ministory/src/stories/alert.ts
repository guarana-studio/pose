import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const alertStory = defineStory({
  args: { variant: "default", title: "Heads up!", child: "Something needs your attention." },
  component: pose.as("div").alert(),
});
