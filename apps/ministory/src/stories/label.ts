import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const labelStory = defineStory({
  args: { for: "email", child: "Email address" },
  component: pose.as("label").label_field(),
});
