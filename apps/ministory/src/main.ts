import pose, { type PoseElement } from "poseui";
import { z } from "zod";
import { buttonStory } from "./stories/button";
import { container } from "./lib/components/container";

// ─── Story registry ──────────────────────────────────────────────────────────

const STORIES = {
  button: buttonStory,
};

type StoryName = keyof typeof STORIES;

// ─── Routing ─────────────────────────────────────────────────────────────────

const STORY_NAMES = Object.keys(STORIES) as StoryName[];
const Route = z.enum(["start", ...STORY_NAMES] as [string, ...string[]]);
type Route = z.infer<typeof Route>;

function parseRoute(hash: string): Route {
  return Route.parse(hash || "start");
}

// ─── UI components ───────────────────────────────────────────────────────────

const logo = pose.as("a").attr("href", "#").child("Pose");

const navLink = pose
  .as("a")
  .input(z.object({ href: z.string(), text: z.string() }))
  .attr("href", (props) => props.href)
  .text("red-500")
  .child((props) => props.text);

const navLinks = STORY_NAMES.map((name) => navLink({ href: `#${name}`, text: name }));

const sidebar = pose
  .as("aside")
  .flex_1()
  .flex()
  .flex_col()
  .border_r()
  .p(2)
  .child([logo, ...navLinks]);

// ─── Layout helpers ──────────────────────────────────────────────────────────

function withLayout(content: PoseElement<any> | string) {
  return pose.as("div").flex().h_screen().child([sidebar, content]);
}

function withContainer(content: PoseElement<any> | string) {
  return container.child(content);
}

// ─── Views ───────────────────────────────────────────────────────────────────

function renderStartView(): string {
  const sourceList = STORY_NAMES.map((name) => pose.as("pre").child(name));
  const content = withContainer(pose.as("div").child(sourceList));
  return withLayout(content)();
}

function renderStoryView(name: StoryName): string {
  const story = STORIES[name];
  const rendered = story.component(story.args);
  return withLayout(withContainer(rendered))();
}

// ─── App shell ───────────────────────────────────────────────────────────────

const appElement = document.querySelector<HTMLDivElement>("#app")!;

function render() {
  const hash = window.location.hash.slice(1);
  const route = parseRoute(hash);

  appElement.innerHTML =
    route === "start" ? renderStartView() : renderStoryView(route as StoryName);
}

window.addEventListener("popstate", render);
render();
