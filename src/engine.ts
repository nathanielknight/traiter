import * as storylet from "./storylet";

export interface Engine {
    takeAction(idx: number): void
    currentStorylet(): storylet.Storylet
}

interface BasicEngineArgs {
    storylets: ReadonlyArray<storylet.Storylet>,
    startAt: string,
    qualities?: ReadonlyArray<storylet.Quality>,
}

/** A basic engine demonstrating how the `Engine` interface
 * might be implemented.
 */
export class BasicEngine implements Engine {
    #storylets: ReadonlyMap<string, storylet.Storylet>
    #qualities: Map<string, storylet.Quality>
    currentStoryletId: string

    constructor({ storylets, qualities, startAt }: BasicEngineArgs) {
        // Readonly, indexed storylets
        const tmpStorylets = new Map()
        for (const s of storylets) {
            tmpStorylets.set(s.id, s)
        }
        this.#storylets = tmpStorylets

        // Starting point
        if (!this.#storylets.has(startAt)) {
            throw new Error(`Starting storylet '${startAt}`)
        }
        this.currentStoryletId = startAt

        // Qualities
        this.#qualities = new Map()
        if (qualities != undefined) {
            for (const q of qualities) {
                this.#qualities.set(q.name, q)
            }
        }
    }

    /** Returns the storylet that is currently playing. */
    currentStorylet(): storylet.Storylet {
        return this.#storylets[this.currentStoryletId]
    }

    /** Take the indicated action from the current storylet, returning the outcome (or ) */
    takeAction(idx: number): undefined | storylet.Outcome {
        const storylet = this.currentStorylet()
        const choice = storylet.choices[idx]
        if (choice == undefined) {
            console.debug(`Choice ${idx} undefined for ${storylet.id}`)
            return
        }
        if (this.#requirementsMet(choice)) {
            console.debug(`Tried to take choice ${idx}; requirements not met`)
            return
        }

        const outcome = this.#apply(choice)
        return outcome
    }

    #apply(choice: storylet.Choice): storylet.Outcome {
        console.debug('Applying choice:', choice)

        function outcomeOf(action: storylet.Action): storylet.Outcome {
            const clamp = (x: number, m: number, M: number): number => Math.min(Math.max(x, m), M)
            switch (choice.action.kind) {
                case "fixed":
                    return choice.action.outcome
                case "chance":
                    if (Math.random() < clamp(choice.action.successChance, 0, 1)) {
                        return choice.action.successOutcome
                    } else {
                        return choice.action.failureOutcome
                    }
                case "check":
                    // TODO
                    throw new Error("TODO: Implement this")
            }
        }

        let outcome = outcomeOf(choice.action)
        this.#applyOutcome(outcome)
        return outcome
    }

    #applyOutcome(outcome: storylet.Outcome): void {
        this.currentStoryletId = outcome.goto ?? this.currentStoryletId
        if (Array.isArray(outcome.changes)) {
            outcome.changes.forEach(c => this.#applyChange(c))
        }
    }

    #applyChange(change: storylet.Change): void {
        switch (change.op) {
            case "set":
                this.#qualities.set(change.quality.name, change.quality)
                return
            case "clear":
                this.#qualities.delete(change.quality)
                return
            case "gain":
                const gainQ: storylet.Quality = this.#qualities.get(change.quality) ?? {
                    name: change.quality, number: 0,
                }
                gainQ.number = (gainQ.number ?? 0) + change.amount
                this.#qualities.set(change.quality, gainQ)
                return
            case "lose":
                const loseQ: storylet.Quality = this.#qualities.get(change.quality) ?? {
                    name: change.quality, number: 0,
                }
                loseQ.number = (loseQ.number ?? 0) - change.amount
                this.#qualities.set(change.quality, loseQ)
                return
            default:
                const exhaustiveCheck: never = change
                throw new Error(`Invalid change type: ${exhaustiveCheck}`)
        }
    }


    #requirementsMet(choice: storylet.Choice): boolean {
        const reqs = choice.requirements ?? []
        return reqs.every(r => this.#requirementMet(r))
    }

    #requirementMet(req: storylet.Requirement): boolean {
        switch (req.pred) {
            // Numeric
            case 'eq':
                return (this.#qualities.get(req.quality)?.number ?? 0) === req.value
            case 'neq':
                return (this.#qualities.get(req.quality)?.number ?? 0) !== req.value
            case 'lt':
                return (this.#qualities.get(req.quality)?.number ?? 0) < req.value
            case 'le':
                return (this.#qualities.get(req.quality)?.number ?? 0) <= req.value
            case 'gt':
                return (this.#qualities.get(req.quality)?.number ?? 0) > req.value
            case 'ge':
                return (this.#qualities.get(req.quality)?.number ?? 0) >= req.value
            // Text
            case 'is':
                return (this.#qualities.get(req.quality)?.text ?? '') === req.value
            case 'isnot':
                return (this.#qualities.get(req.quality)?.text ?? '') !== req.value
            // Flag
            case 'set':
                return this.#qualities.has(req.quality)
            case 'unset':
                return !this.#qualities.has(req.quality)
        }
    }
}