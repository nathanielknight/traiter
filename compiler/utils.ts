import { Storylet } from "../storylet.ts";
import { rusty_markdown } from "./deps.ts";

// ----------------------------------------------------------------------
// Markdown Compilation
function compileMarkdown(s: string): string {
  const tokenized = rusty_markdown.tokens(s);
  return rusty_markdown.html(tokenized);
}

export function compileBodyMarkdown(storylet: Storylet): void {
  storylet.body = compileMarkdown(storylet.body);
  storylet.choices.forEach(c => {
    c.body = compileMarkdown(c.body);
    switch (c.action.kind) {
      case "fixed":
        c.action.outcome.body = compileMarkdown(c.action.outcome.body);
        break;
      case "chance":
      case "check":
        c.action.successOutcome.body = compileMarkdown(c.action.successOutcome.body);
        c.action.failureOutcome.body = compileMarkdown(c.action.failureOutcome.body);
    }
  })
}


// ----------------------------------------------------------------------
// Storylet ID checking


export function missingStoryletIds(s: Storylet, ids: Set<string>): Array<string> {
  const missing: Array<string> = [];

  const checkID = (id: string | undefined): void => {
    if (id == undefined) {
      return
    }
    if (!ids.has(id)) {
      missing.push(id);
    }
  }
  s.choices.forEach((c) => {
    switch (c.action.kind) {
      case "fixed":
        checkID(c.action.outcome.goto);
        break;
      case "chance":
      case "check":
        checkID(c.action.successOutcome.goto);
        checkID(c.action.failureOutcome.goto);
        break;
    }
  });
  return missing;

}
