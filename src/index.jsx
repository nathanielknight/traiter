import * as React from 'react';
import { render } from 'react-dom';


function ChoiceUI(props) {
    const actions = Array.from(
        props.storylet.actions.map((action, idx) => {
            return (<div className="traiter-action" key={idx}>
                <div
                    className="action-traiter-body"
                    dangerouslySetInnerHTML={{ __html: action.body }}
                >
                </div>
                <button onClick={() => props.takeAction(idx)} value="Go" />
            </div>);
        })
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

function init(element) {
    let storylet = {
        body: "<p>Once there was a <b>Way</b> to get back <i>Home</i>.</p>",
        actions: [
            {body: "<p>Thing the first</p>"},
            {body: "<p>Thing the second</p>"},
        ]
        
    };
    render(<ChoiceUI storylet={storylet} takeAction={(idx) => console.info(`took action ${idx}`)}/>, traiter);
}


let e = document.getElementById("traiter");
init(e);