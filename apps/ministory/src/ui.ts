import { createPose } from "poseui";
import { basecoat, BtnSchema } from "poseui/presets/basecoat";
import { tailwind4 } from "poseui/presets/tailwind4";
import { z } from "zod";

export const pose = createPose({
  presets: [basecoat, tailwind4],
});

export const div = pose.as("div");

// ─── Nav items ────────────────────────────────────────────────────────────

const navLink = pose
  .as("a")
  .input(z.object({ href: z.string(), text: z.string() }))
  .attr("href", (p) => p.href)
  .capitalize()
  .child((p) => p.text);

function createStoryLinks(storyNames: string[]) {
  return storyNames.map((name) => pose.as("li").child([navLink({ href: `#${name}`, text: name })]));
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

export function createSidebar(storyNames: string[]) {
  const storyLinks = createStoryLinks(storyNames);

  const logo = pose
    .as("a")
    .btn()
    .input(BtnSchema.extend({ href: z.string() }))
    .attr("href", (p) => p.href)
    .font_semibold()
    .justify_start()({ variant: "ghost", child: "poseui", href: "#" });

  const sidebarGroup = pose
    .as("div")
    .attr("role", "group")
    .attr("aria-labelledby", "group-label-content-1")
    .child([
      logo,
      pose.as("h3").attr("id", "group-label-content-1").child("Stories"),
      pose.as("ul").child(storyLinks)(),
    ]);

  return pose
    .as("aside")
    .attr("class", "sidebar")
    .attr("data-side", "left")
    .attr("aria-hidden", "false")
    .child(
      pose
        .as("nav")
        .attr("aria-label", "Sidebar navigation")
        .child(pose.as("section").cls("scrollbar").child(sidebarGroup())())(),
    );
}
