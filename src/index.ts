import { start } from "./traiter";
import { Storylet } from "./storylet";

const storylets: ReadonlyArray<Storylet> = [
    {
        id: "start",
        body: "<p>We're at start</p>",
        choices: [
            {
                body: "<p>Go to bar</p>",
                action: {
                    kind: "fixed",
                    outcome: { body: "You went to bar.", goto: "bar" }
                }
            }
        ],
    },
    {
        id: "bar",
        body: "<p>We're at bar</p>",
        choices: [
            {
                body: "<p>Stay</p>",
                action: {
                    kind: "fixed",
                    outcome: {
                        body: "Staying here.",
                        changes: [
                            { op: "gain", quality: "Stay length", amount: 1 }
                        ]
                    },
                }
            },
            {
                body: "<p>Back</p>",
                requirements: [
                    { pred: "gt", quality: "Stay length", value: 3 }
                ],
                action: {
                    kind: "fixed",
                    outcome: {
                        body: "Go back to the start",
                        changes: [
                            { op: "clear", quality: "Stay length" }
                        ],
                        goto: "start"
                    },
                }
            },
	    {
		    body: "<p>Reset</p>",
		    action: {
			    kind: "fixed",
			    outcome: {
				    "body": "<p>All that fer nothin</p>",
				    changes: [
					    {op: "clear", quality: "Stay length"}
				    ],
			    },
		    },
	    },
        ]
    }
];

start({ storylets, startAt: "start"})
