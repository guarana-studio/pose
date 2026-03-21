import "./app.css";
import "virtual:uno.css";
import "basecoat-css/all";
import { html } from "poseui";
import { z } from "zod";

import { createContainer } from "./lib/components/container";
import { pose, div, createSidebar } from "./ui";

const container = createContainer(pose);

// ─── Story registry ──────────────────────────────────────────────────────────

import { alertStory } from "./stories/alert";
import { badgeStory } from "./stories/badge";
import { buttonStory } from "./stories/button";
import { cardStory } from "./stories/card";
import { inputStory } from "./stories/input";
import { kbdStory } from "./stories/kbd";
import { labelStory } from "./stories/label";
import { tableStory } from "./stories/table";
import { tabsStory } from "./stories/tabs";
import { textareaStory } from "./stories/textarea";
import { tooltipStory } from "./stories/tooltip";

const STORIES = {
  button: buttonStory,
  badge: badgeStory,
  alert: alertStory,
  card: cardStory,
  input: inputStory,
  textarea: textareaStory,
  label: labelStory,
  kbd: kbdStory,
  table: tableStory,
  tabs: tabsStory,
  tooltip: tooltipStory,
};

type StoryName = keyof typeof STORIES;

// ─── Routing ─────────────────────────────────────────────────────────────────

const STORY_NAMES = Object.keys(STORIES) as StoryName[];
const Route = z.enum(["start", ...STORY_NAMES] as [string, ...string[]]);
type Route = z.infer<typeof Route>;

function parseRoute(hash: string): Route {
  return Route.parse(hash || "start");
}

// ─── Layout components ───────────────────────────────────────────────────────

const sidebar = createSidebar(STORY_NAMES);

const propertiesPanel = div
  .flex_1()
  .border_l()
  .p(2)
  .child([pose.as("h2").text_lg().font_semibold().child("Properties")]);

// ─── Views ───────────────────────────────────────────────────────────────────

function renderStartView(): string {
  const sourceList = STORY_NAMES.map((name) => `<pre>${name}</pre>`).join("");

  return html`
    <div ${div.flex().h_screen()}>
      ${sidebar}
      <div ${container}>
        ${sourceList}
      </div>
    </div>
  `();
}

function renderStoryView(name: StoryName): string {
  const story = STORIES[name];
  const rendered = story.component(story.args);

  return html`
    <div ${div.flex().h_screen()}>
      ${sidebar}
      <div ${container}>
        <div ${div.flex_1().flex().w_full()}>
          <div ${div.cls("flex-[2]")}>
            ${rendered}
          </div>
          ${propertiesPanel}
        </div>
      </div>
    </div>
  `();
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
