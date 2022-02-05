import { walk, WalkEntry } from "https://deno.land/std@0.125.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.125.0/encoding/yaml.ts";

import { Storylet } from "../storylet.ts";
import { checkStorylet } from "./schema.ts";
import { compileBodyMarkdown, missingStoryletIds } from "./utils.ts";

interface ParsedStorylet {
  entry: WalkEntry;
  storylet: Storylet;
}

async function loadStorylet(src: WalkEntry): Promise<Storylet> {
  if (!src.isFile) {
    throw new Error(`${src.path} is not a yaml file`);
  }
  const content = await Deno.readTextFile(src.path);
  const parsed = parse(content);
  const checked = checkStorylet(parsed);
  return checked;
}

async function loadStorylets(
  sourceDirPath: string,
): Promise<Array<ParsedStorylet>> {
  const storylets = [];
  for await (
    const entry of walk(sourceDirPath, {
      exts: ["yaml", "yml"],
      includeDirs: false,
      includeFiles: true,
    })
  ) {
    const storylet = await loadStorylet(entry);
    storylets.push({ entry, storylet });
  }
  return storylets;
}

/** Perform transformations on a storylet.
 *
 * - Compile markdown bodies
 */
function process(s: ParsedStorylet): ParsedStorylet {
  compileBodyMarkdown(s.storylet);
  return s;
}

function checkOk(ps: ReadonlyArray<ParsedStorylet>): boolean {
  const storyletIDs = new Set(Array.from(ps.map(p => p.storylet.id)));
  // TODO: check for and report problemsm (missing storylets)
  ps.forEach(p => {
    const missing = missingStoryletIds(p.storylet, storyletIDs);
    if (missing.length > 0) {
      const msg = `${p.entry.path} refers to non-existent storylet(s): ${missing.join(',')}`;
      console.warn(msg)
    }
  })
  return true;
}

async function main() {
  // Args
  if (Deno.args.length != 1) {
    console.error("usage: traiterc <source dir>");
    Deno.exit(1);
  }
  const [sourceDirPath] = Deno.args;

  // Load storylets
  const storylets = await loadStorylets(sourceDirPath);

  // Process storylets
  const processedStorylets = storylets.map(process);
  checkOk(processedStorylets);

  // Print storylets to stdout
  const output = JSON.stringify(processedStorylets.map((ps) => ps.storylet));
  const encoder = new TextEncoder();
  await Deno.stdout.write(encoder.encode(output));
}

await main();
