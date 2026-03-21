import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const textareaStory = defineStory({
  args: {
    name: "message",
    placeholder: "Enter your message",
    rows: 4,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    child: "",
  },
  component: pose.as("textarea").textarea_field(),
});
