import * as React from 'react';
import { render } from 'react-dom';



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


function ChoiceUI(props) {
    const actions = Array.from(
        props.storylet.actions.map((action, idx) => Action({ action, idx, takeAction: () => props.takeAction(idx) }))
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

class TraiterPlayer extends React.Component {
    constructor(props) {
        this.engine = props.engine;
        this.state = {
            storylet: this.engine.currentStorylet(),
        };
    }

    render() {
        return ChoiceUI({
            storylet: this.state.storylet,
            takeAction: (idx) => this.takeAction(idx),
        })
    }

    takeAction(idx) {
        this.engine.takeAction(idx);
        this.setState({
            storylet: this.engine.currentStorylet(),
        });
    }
}

class TestEngine {
    constructor({storylets}) {
        this.storylets = storylets;
        this.currentStorylet = "start";
    }

    currentStorylet() {
        return this.storylets.get(this.currentStorylet);
    }

    takeAction(idx) {
        let storylet = this.currentStorylet();
        let action = storylet.actions[idx];
        if (action == undefined) {
            return;
        }
        this.applyAction(action);
    }

    applyAction(action) {XMLDocument    
        // TODO(nknight): Implement this
        console.log("taking action: ", action);
    }
}

function init(element) {
    let storylet = {
        body: "<p>Once there was a <b>Way</b> to get back <i>Home</i>.</p>",
        actions: [
            { body: "<p>Thing the first</p>" },
            { body: "<p>Thing the second</p>" },
        ]

    };
    render(<ChoiceUI storylet={storylet} takeAction={(idx) => console.info(`took action ${idx}`)} />, traiter);
}


let e = document.getElementById("traiter");
init(e);