import * as s from "../storylet.ts";
import { rusty_markdown } from "./deps.ts";

function compileMarkdown(s: string): string {
    const tokenized = rusty_markdown.tokens(s);
    return rusty_markdown.html(tokenized);
}

export function compileBodyMarkdown(storylet: s.Storylet): void {
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