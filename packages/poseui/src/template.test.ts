// =============================================================================
// Tests for html`` tagged template literal
// Run with: bun test
// =============================================================================

import { it, expect, describe } from "bun:test";

import { createPose } from "poseui";
import { z } from "zod";

import { html, slot } from "./template";

const pose = createPose();

// ---------------------------------------------------------------------------
// Static rendering
// ---------------------------------------------------------------------------

describe("static rendering", () => {
  it("renders a plain static template with no slots", () => {
    const t = html`
      <div><p>Hello</p></div>
    `;
    expect(t()).toEqual("<div><p>Hello</p></div>");
  });

  it("renders string slot literally", () => {
    const t = html`<p>${"world"}</p>`;
    expect(t()).toEqual("<p>world</p>");
  });

  it("renders number slot literally", () => {
    const t = html`<p>${42}</p>`;
    expect(t()).toEqual("<p>42</p>");
  });

  it("omits null slot", () => {
    const t = html`<p>${null}</p>`;
    expect(t()).toEqual("<p></p>");
  });

  it("omits undefined slot", () => {
    const t = html`<p>${undefined}</p>`;
    expect(t()).toEqual("<p></p>");
  });
});

// ---------------------------------------------------------------------------
// Dynamic (props) slots
// ---------------------------------------------------------------------------

describe("dynamic prop slots", () => {
  it("calls a function slot with props", () => {
    const t = html<{ name: string }>`<p>${({ name }) => name}</p>`;
    expect(t({ name: "Ada" })).toEqual("<p>Ada</p>");
  });

  it("supports multiple function slots", () => {
    const t = html<{ first: string; last: string }>`
      <p>${({ first }) => first} ${({ last }) => last}</p>
    `;
    expect(t({ first: "Ada", last: "Lovelace" })).toEqual("<p>Ada Lovelace</p>");
  });

  it("returns empty string when function slot returns null", () => {
    const t = html<{ show: boolean }>`<p>${({ show }) => (show ? "yes" : null)}</p>`;
    expect(t({ show: false })).toEqual("<p></p>");
  });
});

// ---------------------------------------------------------------------------
// PoseElement as child slot (full render)
// ---------------------------------------------------------------------------

describe("PoseElement as child slot", () => {
  it("renders a static PoseElement child", () => {
    const badge = pose.as("span").cls("badge").child("New");
    const t = html`<div>${badge}</div>`;
    expect(t()).toEqual('<div><span class="badge">New</span></div>');
  });

  it("threads props into a PoseElement child", () => {
    const greeting = pose
      .as("p")
      .input(z.object({ name: z.string() }))
      .child(({ name }) => `Hello, ${name}`);

    const t = html<{ name: string }>`<div>${greeting}</div>`;
    expect(t({ name: "Ada" })).toEqual("<div><p>Hello, Ada</p></div>");
  });

  it("renders multiple PoseElement children", () => {
    const h = pose.as("h1").child("Title");
    const p = pose.as("p").child("Body");
    const t = html`<article>${h}${p}</article>`;
    expect(t()).toEqual("<article><h1>Title</h1><p>Body</p></article>");
  });
});

// ---------------------------------------------------------------------------
// PoseElement in opening-tag position (attr spread)
// ---------------------------------------------------------------------------

describe("PoseElement as opening-tag spread", () => {
  it("merges class into the host tag", () => {
    const card = pose.as("div").cls("rounded shadow p-4");
    const t = html`<div ${card}><p>content</p></div>`;
    expect(t()).toEqual('<div class="rounded shadow p-4"><p>content</p></div>');
  });

  it("merges static attrs into the host tag", () => {
    const btn = pose.as("button").attr("type", "submit").attr("disabled", "");
    const t = html`<button ${btn}>Save</button>`;
    expect(t()).toEqual('<button type="submit" disabled>Save</button>');
  });

  it("merges class and attrs together", () => {
    const input = pose.as("input").cls("form-input").attr("type", "email").attr("required", "");
    const t = html`<input ${input} />`;
    expect(t()).toEqual('<input class="form-input" type="email" required />');
  });

  it("threads props into spread attrs", () => {
    const link = pose
      .as("a")
      .input(z.object({ external: z.boolean().default(false) }))
      .attr("target", ({ external }) => (external ? "_blank" : null))
      .attr("rel", ({ external }) => (external ? "noopener noreferrer" : null));

    const t = html<{ external: boolean }>`<a ${link} href="/page">Click</a>`;
    expect(t({ external: true })).toEqual(
      '<a target="_blank" rel="noopener noreferrer" href="/page">Click</a>',
    );
    expect(t({ external: false })).toEqual('<a href="/page">Click</a>');
  });

  it("handles spread with no classes or attrs (empty fragment)", () => {
    const bare = pose.as("div"); // no cls, no attrs
    const t = html`<div ${bare}>x</div>`;
    // No class or attr string emitted — trailing space is consumed.
    expect(t()).toEqual("<div>x</div>");
  });
});

// ---------------------------------------------------------------------------
// Nesting templates with slot()
// ---------------------------------------------------------------------------

describe("nesting templates with slot()", () => {
  it("nests a Template inside another template", () => {
    const inner = html`
      <span>inner</span>
    `;
    const outer = html`<div>${slot(inner)}</div>`;
    expect(outer()).toEqual("<div><span>inner</span></div>");
  });

  it("threads props through nested templates", () => {
    const inner = html<{ name: string }>`<b>${({ name }) => name}</b>`;
    const outer = html<{ name: string }>`<p>Hello, ${slot(inner)}!</p>`;
    expect(outer({ name: "Ada" })).toEqual("<p>Hello, <b>Ada</b>!</p>");
  });

  it("supports deeply nested templates", () => {
    const leaf = html<{ x: string }>`<em>${({ x }) => x}</em>`;
    const mid = html<{ x: string }>`<span>${slot(leaf)}</span>`;
    const root = html<{ x: string }>`<div>${slot(mid)}</div>`;
    expect(root({ x: "deep" })).toEqual("<div><span><em>deep</em></span></div>");
  });
});

// ---------------------------------------------------------------------------
// Complex composition — the login card from the screenshot
// ---------------------------------------------------------------------------

describe("complex composition", () => {
  it("composes a login card matching the screenshot pattern", () => {
    const pose = createPose();

    const card = pose.as("div").cls("card");
    const loginForm = pose.as("form").attr("method", "post");
    const emailLabel = pose.as("label").attr("for", "email");
    const emailInput = pose.as("input").attr("type", "email").attr("id", "email");
    const cardFooter = pose.as("footer").cls("card-footer");
    const loginBtn = pose.as("button").attr("type", "submit").cls("btn-primary");
    const googleBtn = pose.as("button").attr("type", "button").cls("btn-google");

    const loginCard = html`
      <div ${card}>
        <header>
          <h2>Login to your account</h2>
          <p>Enter your details below</p>
        </header>
        <section>
          <form ${loginForm}>
            <div class="grid gap-2">
              <label ${emailLabel}>Email</label>
              <input ${emailInput} />
            </div>
          </form>
        </section>
        <footer ${cardFooter}>
          <button ${loginBtn}>Login</button>
          <button ${googleBtn}>Login with Google</button>
        </footer>
      </div>
    `;

    const html_out = loginCard();

    // Structural checks
    expect(html_out).toContain('class="card"');
    expect(html_out).toContain('method="post"');
    expect(html_out).toContain('for="email"');
    expect(html_out).toContain('type="email"');
    expect(html_out).toContain('id="email"');
    expect(html_out).toContain('class="card-footer"');
    expect(html_out).toContain('type="submit"');
    expect(html_out).toContain('class="btn-primary"');
    expect(html_out).toContain('class="btn-google"');
    expect(html_out).toContain("Login to your account");
    expect(html_out).toContain("Login with Google");
  });

  it("threads props through a composed template", () => {
    type Props = { username: string; loggedIn: boolean };

    const greeting = pose
      .as("p")
      .input(z.object({ username: z.string(), loggedIn: z.boolean() }))
      .cls(({ loggedIn }) => (loggedIn ? "text-green-600" : "text-gray-400"))
      .child(({ username, loggedIn }) =>
        loggedIn ? `Welcome back, ${username}` : "Please log in",
      );

    const t = html<Props>`
      <div>
        ${greeting}
        ${({ loggedIn }) => (loggedIn ? "<span>✓</span>" : "")}
      </div>
    `;

    const out_in = t({ username: "Ada", loggedIn: true });
    const out_out = t({ username: "Ada", loggedIn: false });

    expect(out_in).toContain("Welcome back, Ada");
    expect(out_in).toContain("text-green-600");
    expect(out_in).toContain("<span>✓</span>");

    expect(out_out).toContain("Please log in");
    expect(out_out).toContain("text-gray-400");
    expect(out_out).not.toContain("<span>✓</span>");
  });
});
