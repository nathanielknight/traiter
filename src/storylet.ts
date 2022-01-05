/** Interface definition for a storylet */

interface Storylet {
    id: string
    body: string
    choices: ReadonlyArray<Choice>
}

interface Choice {
    body: string
    requirements?: ReadonlyArray<Requirement>  // Default is no requirements
    action: FixedAction | ChanceAction | CheckAction
}

interface FixedAction {
    outcome: Outcome
}

interface ChanceAction {
    successChance: number,
    successOutcome: Outcome
    failureOutcome: Outcome
}

interface CheckAction {
    quality: string
    target: number
    successOutcome: Outcome
    failureOutcome: Outcome
}

interface Outcome {
    body: string
    changes?: ReadonlyArray<Change>  // Default is no changes
    goto?: string  // Default is to stay on the current storlyet
}

/** This is how qualities are stored; they're not encoded in the Storlyet format. */
interface Quality {
    name: string,
    number?: number // Defaults to 0
    text?: string // Deraults to ""
}
// TODO: flesh these out
type Requirement =
    // Numeric requirements
    { pred: "eq", quality: string, value: number }
    | { pred: "neq", quality: string, value: number }
    | { pred: "lt", quality: string, value: number }
    | { pred: "le", quality: string, value: number }
    | { pred: "gt", quality: string, value: number }
    | { pred: "gt", quality: string, value: number }
    // Text requirements
    | { pred: "is", quality: string, value: string }
    | { pred: "isnot", quality: string, value: string }
    // Flag requirements
    | { pred: "set", quality: string }
    | { pred: "unset", quality: string }

type Change =
    { op: "set", quality: string, number?: number, text?: string }
    | { op: "clear", quality: string }
    | { op: "gain", quality: string, amount: number }
    | { op: "lose", quality: string, amount: number }
