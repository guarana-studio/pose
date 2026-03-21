import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const inputStory = defineStory({
  args: {
    type: "text",
    name: "email",
    placeholder: "Enter your email",
    value: "",
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
  },
  component: pose.as("input").input_field(),
});
