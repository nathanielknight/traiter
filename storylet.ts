/** Interface definition for a storylet */

export interface Storylet {
    id: string
    body: string
    choices: ReadonlyArray<Choice>
}

export interface Choice {
    body: string
    requirements?: ReadonlyArray<Requirement>  // Default is no requirements
    action: Action
}

export type Action = FixedAction | ChanceAction | CheckAction

export interface FixedAction {
    kind: "fixed"
    outcome: Outcome
}

export interface ChanceAction {
    kind: "chance"
    successChance: number,
    successOutcome: Outcome
    failureOutcome: Outcome
}

export interface CheckAction {
    kind: "check"
    quality: string
    target: number
    successOutcome: Outcome
    failureOutcome: Outcome
}

export interface Outcome {
    body: string
    changes?: ReadonlyArray<Change>  // Default is no changes
    goto?: string  // Default is to stay on the current storlyet
}

/** This is how qualities are stored; they're not encoded in the Storlyet format. */
export interface Quality {
    name: string,
    number?: number // Defaults to 0
    text?: string // Deraults to ""
}

export type Requirement =
    // Numeric requirements
    { pred: "eq", quality: string, value: number }
    | { pred: "neq", quality: string, value: number }
    | { pred: "lt", quality: string, value: number }
    | { pred: "le", quality: string, value: number }
    | { pred: "gt", quality: string, value: number }
    | { pred: "ge", quality: string, value: number }
    // Text requirements
    | { pred: "is", quality: string, value: string }
    | { pred: "isnot", quality: string, value: string }
    // Flag requirements
    | { pred: "set", quality: string }
    | { pred: "unset", quality: string }

export type Change =
    { op: "set", quality: Quality }
    | { op: "clear", quality: string }
    | { op: "gain", quality: string, amount: number }
    | { op: "lose", quality: string, amount: number }
