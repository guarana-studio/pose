import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const tabsStory = defineStory({
  args: {
    tabs: [
      { id: "account", label: "Account", content: "<p>Account settings content</p>" },
      { id: "security", label: "Security", content: "<p>Security settings content</p>" },
      { id: "notifications", label: "Notifications", content: "<p>Notification preferences</p>" },
    ],
    active: "account",
  },
  component: pose.as("div").tabs_group(),
});
