/** Core checks
- existence of required fields (id, bodies, outcome OR check & success & failure)
- no missing story IDs
*/

function checkField(obj, nm, report) {
    if (obj[nm] === undefined) {
        report(`Missing field ${nm}`);
    }
}

function checkFields(obj, nms, report) {
    return nms.forEach(nm => checkField(obj, nm, report);
}

function checkStoryletFields(storylet, report) {
    checkFields(storylet, ["id", "body", "actions"], report);
}

function checkOutcomeFields(outcome, report) {
    checkFields(outcome, ["body", "changes"], report);
}

function checkActionFields(action, report) {
    const fixedFields = ["body", "requires", "outcome"];
    const checkFields = ["body", "requires", "check", "success", "failure"];
    if (action["outcome"] !== undefined) {
        checkFields(action, fixedFields, report);
        checkOutcomeFields(action["outcome"], report);
    } else {
        checkFields(action, checkFields, report);
        checkOutcomeFields(action["success"], report);
        checkOutcomeFields(action["failure"], report);
    }
}

function requiredFields(opts) {
    report = (msg) => {
        if (opts.throw) {
            throw new Error(mst);
        } else {
            console.warn(msg);
        }
    }

    return function (storylet) {
        
    }

}