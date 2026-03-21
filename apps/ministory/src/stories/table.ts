import { defineStory } from "../lib/utils";
import { pose } from "../ui";

export const tableStory = defineStory({
  args: {
    caption: "User List",
    head: "<tr><th>Name</th><th>Email</th></tr>",
    body: "<tr><td>Ada</td><td>ada@example.com</td></tr><tr><td>Bob</td><td>bob@example.com</td></tr>",
    foot: "<tr><td>Total</td><td>2 users</td></tr>",
  },
  component: pose.as("table").data_table(),
});
