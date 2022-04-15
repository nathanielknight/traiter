import { Storylet, Change } from "../storylet.ts";
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


// Change Parsing

export function tryParseChange(src: string): null | Change {
  for (const p of [tryParseClear, tryParseGainLose, tryParseSet]) {
    const v = p(src);
    if (v != null) {
      return v;
    }
  }
  return null;
}

const CLEAR_PATTERN = new RegExp(/^clear ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)$/);

function tryParseClear(src: string): null | { op: "clear", quality: string } {
  const match = src.match(CLEAR_PATTERN);
  if (match == null) {
    return null;
  }
  const [_, quality] = match;
  return { op: "clear", quality };
}

const GAINLOSE_PATTERN = new RegExp(/^(gain|lose) (\d+) ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)$/);

function tryParseGainLose(src: string): null | { op: "gain" | "lose", quality: string, amount: number } {
  const match = src.match(GAINLOSE_PATTERN);
  if (match == null) {
    return null;
  }
  const [_, op, amountSrc, quality] = match;
  const amount = Number.parseInt(amountSrc);
  return { op: op as "gain" | "lose", amount, quality };
}

const SET_NT_PATTERN = new RegExp(/^set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = (\d+) ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)$/);
const SET_N_PATTERN = new RegExp(/^set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = (\d+)$/);
const SET_T_PATTERN = new RegExp(/^set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)$/);

function tryParseSet(src: string) : null | {op: "set", quality: string, number?: number, text?: string } {
  let match = src.match(SET_NT_PATTERN);
  if (match != null) {
    const [_, quality, numberSrc, text] = match;
    const number = Number.parseInt(numberSrc);
    return {op: "set", quality, number, text};
  }
  match = src.match(SET_N_PATTERN);
  if (match != null) {
    const [_, quality, numberSrc] = match;
    const number = Number.parseInt(numberSrc);
    return {op: "set", quality, number};
  }
  match = src.match(SET_T_PATTERN);
  if (match != null) {
    const [_, quality, text] = match;
    return {op: "set", quality, text};
  }
  return null;
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
