import { assertEquals } from "https://deno.land/std@0.125.0/testing/asserts.ts";

import { tryParseChange } from "./utils.ts";

import { Change } from "../storylet.ts";

Deno.test("Parsing changes", () => {
    const omnigram = "Sphinx of black quartz: judge my vow!";
    const puncts = `,.:;"'!?-_/\()[]+`;
    const cases: Array<[string, Change]> = [
        // Gain/Lose
        ["gain 1 x", { op: "gain", amount: 1, quality: "x" }],
        ["lose 2 y", { op: "lose", amount: 2, quality: "y" }],
        ["gain 11 Foo, the bar?", { op: "gain", amount: 11, quality: "Foo, the bar?" }],
        [
            `lose 123 ${omnigram}`,
            { op: "lose", amount: 123, quality: omnigram }
        ],
        [
            "gain 1 1",
            { op: "gain", amount: 1, quality: "1" },
        ],
        [
            `lose 1 also these: ${puncts}`,
            { op: "lose", amount: 1, quality: `also these: ${puncts}` },
        ],
        // Clear
        ["clear foobar", { op: "clear", quality: "foobar" }],
        [
            `clear how about ${puncts}, eh?`,
            { op: "clear", quality: `how about ${puncts}, eh?` },
        ],
        // Set
        [
            "set abracadabra = foobaz",
            {op: "set", quality: "abracadabra", text: "foobaz"}
        ],
        [
            "set abracadabra = 3",
            {op: "set", quality: "abracadabra", number: 3},
        ],
        [
            "set abracadabra = 3 foobaz",
            {op: "set", quality: "abracadabra", text: "foobaz", number: 3},
        ],
        [
            `set ${omnigram} ${puncts} = 123 ${omnigram} ${puncts}`,
            {op: "set", quality: `${omnigram} ${puncts}`, number: 123, text: `${omnigram} ${puncts}`}
        ],
    ];
    for (const [src, expected] of cases) {
        assertEquals(tryParseChange(src), expected);
    }
});