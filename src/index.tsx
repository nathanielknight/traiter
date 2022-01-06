import * as React from 'react';
import { render } from 'react-dom';
import * as storylet from "./storylet";
import * as engine from "./engine";



function Action(props) {
    return (<div className='traiter-action' key={props.idx}>
        <div
            className="action-traiter-body"
            dangerouslySetInnerHTML={{ __html: props.action.body }}
        >
        </div>
        <button onClick={props.takeAction}>{props.verb ?? "Go"}</button>
    </div >)
}


interface ChoiceUIProps {
    readonly storylet: storylet.Storylet
    takeAction: (n: number) => void,
}

function ChoiceUI(props: ChoiceUIProps) {
    console.info("ChoiceUI props: ", props);
    const actions = Array.from(
        props.storylet.choices.map((choice, idx) => Action({ action: choice.action, idx, takeAction: () => props.takeAction(idx) }))
    );
    console.info(actions);

    return (
        <div className="traiter-choose">
            <div className="traiter-body"
                dangerouslySetInnerHTML={{ __html: props.storylet.body }}
            ></div>
            <div className="traiter-actions">
                {actions}
            </div>
        </div>
    );
}


interface PlayerProps {
    engine: engine.Engine
}

class TraiterPlayer extends React.Component<PlayerProps> {
    #engine: engine.Engine
    constructor(props: PlayerProps) {
        super(props)
        this.#engine = props.engine
    }

    render() {
        const storylet = this.#engine.currentStorylet()
        const takeAction = (idx: number) => {
            this.#engine.takeAction(idx)
            this.forceUpdate()
        }
        return <ChoiceUI storylet={storylet} takeAction={takeAction} />
    }
}

const testStorylets: ReadonlyArray<storylet.Storylet> = [
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
            }
        ]
    }
]

function init(element) {
    const e = new engine.BasicEngine({ storylets: testStorylets, startAt: "start" })
    render(<TraiterPlayer engine={e} />, element);
}


let e = document.getElementById("traiter");
init(e);