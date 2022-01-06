let activeChoice, engine, lastOutcome

// -------------------------------------------------------------------------
// TEMPLATES/UI

function choice (choice, idx) {
  const target = document.createElement('div')
  target.classList.add('traiter-choice')

  const body = document.createElement('div')
  body.classList.add('traiter-body')
  body.innerHTML = choice.body

  const reqs = requirements(choice.requirements ?? [])

  const button = document.createElement('button')
  button.classList.add('traiter-choice-button')
  button.addEventListener('click', () => takeChoice(idx))
  button.innerText = 'Go'
  if (!engine.requirementsMet(choice)) {
    button.disabled = true
    target.classList.add('traiter-unavailable')
  }

  target.replaceChildren(body, reqs, button)
  return target
}

function storyletContent (storylet) {
  const body = document.createElement('div')
  body.classList.add('traiter-storylet-body')
  body.innerHTML = storylet.body

  const choices = storylet.choices.map(choice)

  return [body, ...choices]
}

function outcomeContent (outcome) {
  const body = document.createElement('div')
  body.classList.add('traiter-outcome')
  body.innerHTML = outcome.body

  // TODO display changes

  const next = document.createElement('button')
  next.innerText = 'Continue'
  next.addEventListener('click', () => continueToStorylet())

  return [body, next]
}

function requirements (reqs) {
  const element = document.createElement('div')
  element.classList.add('traiter-requirements')

  if (reqs.length > 0) {
    const list = document.createElement('ul')
    list.replaceChildren(...reqs.map(requirement))
    element.replaceChildren('Requires:', list)
  }

  return element
}

function requirement (req) {
  const li = document.createElement('li')
  li.innerText = `"${req.quality}" ${req.pred} ${req.value ?? ''}`
  return li
}

// -------------------------------------------------------------------------
// State Management

function setStorylet (storylet) {
  const target = document.getElementById('traiter-main')
  target.classList.replace('traiter-outcome', 'traiter-storylet')
  const newContent = storyletContent(storylet)
  target.replaceChildren(...newContent)
  focusFirstChoice()
}

function setOutcome (outcome) {
  const target = document.getElementById('traiter-main')
  target.classList.replace('traiter-storylet', 'traiter-outcome')
  const newContent = outcomeContent(outcome)
  target.replaceChildren(...newContent)
  target.children[1].focus()
}

function takeChoice (idx) {
  let outcome = engine.takeChoice(idx)
  if (outcome == undefined) {
    return
  }
  setOutcome(outcome)
}

function continueToStorylet () {
  setStorylet(engine.currentStorylet())
}

function focusNextChoice () {
  console.info('focus next')
  const choices = document.getElementsByClassName('traiter-choice-button')

  if (activeChoice != undefined) {
    const next = choices[activeChoice + 1]
    if (next !== undefined) {
      activeChoice = activeChoice + 1
      next.focus()
    }
  } else {
    focusFirstChoice()
  }
}

function focusFirstChoice () {
  activeChoice = 0
  document.getElementsByClassName('traiter-choice-button')[0]?.focus()
}

function focusPrevChoice () {
  console.info('focus prev')
  const choices = document.getElementsByClassName('traiter-choice-button')
  if (activeChoice != undefined) {
    const prev = choices[activeChoice - 1]
    if (prev !== undefined) {
      activeChoice = activeChoice - 1
      prev.focus()
    }
  } else {
    focusLast()
  }
}

function focusLast () {
  const choices = document.getElementsByClassName('traiter-choice-button')
  activeChoice = choices.length - 1
  choices[choices.length - 1].focus()
}

function initializeChoiceKeyListeners () {
  const nextKeys = new Set(['KeyJ', 'KeyN'])
  const prevKeys = new Set(['KeyK', 'KeyP'])
  window.addEventListener('keydown', event => {
    if (nextKeys.has(event.code)) {
      focusNextChoice()
    }
    if (prevKeys.has(event.code)) {
      focusPrevChoice()
    }
  })
}

// -------------------------------------------------------------------------
// Game Logic

Number.prototype.clamp = function (min, max) {
  return
}

/** Manages player qualities, changes, and .
 */
class Engine {
  constructor (storylets) {
    this.storylets = new Map()
    for (const storylet of storylets) {
      this.storylets.set(storylet.id, storylet)
    }
    this._currentID = 'start'
    this.qualities = new Map()
  }

  currentStorylet () {
    return this.storylets.get(this._currentID)
  }

  /** Given a choice index, take the choice with that index on the current storylet. */
  takeChoice (idx) {
    let storylet = this.currentStorylet()
    let choice = storylet.choices[idx]
    // Check that the index corresponds to a choice on the current storylet
    if (choice == undefined) {
      console.debug(`Choice ${idx} undefined for ${storylet.id}`)
      return
    }
    if (!this.requirementsMet(choice)) {
      console.debug(`Tried to take choice ${idx}; requirements not met`)
      return
    }

    // Apply the changes and return the outcome
    let outcome = this.apply(choice)
    activeChoice = undefined
    return outcome
  }

  /** Given a choice, take it, and return the (possibly randomized) outcome. */
  apply (choice) {
    console.debug('Applying choice:', choice)

    function actionKind (action) {
      const keys = Object.keys(action)
      if (keys.includes('quality')) {
        return 'check'
      }
      if (keys.includes('successChance')) {
        return 'chance'
      }
      if (keys.includes('outcome')) {
        return 'fixed'
      }
      throw new Error(`Invalid choice:  ${JSON.stringify(action)}`)
    }

    function outcomeOf (action) {
      function clamp (x, m, M) {
        Math.min(Math.max(x, m), M)
      }

      const kind = actionKind(action)
      if (kind === 'fixed') {
        return action.outcome
      }
      if (kind === 'chance') {
        const target = clamp(action.target, 0, 1)
        const roll = Math.random()
        if (roll <= target) {
          return action.successOutcome
        } else {
          return action.failureOutcome
        }
      }
      if (kind === 'check') {
        throw new Error('TODO: Implement this')
      }
    }

    const outcome = outcomeOf(choice.action)

    this.applyOutcome(outcome)

    return outcome
  }

  /** Given an outcome, apply its changes. */
  applyOutcome (outcome) {
    // Change storylet, if indicated
    this._currentID = outcome.goto ?? this._currentID
    lastOutcome = Object.assign({}, outcome)
    if (Array.isArray(outcome.changes)) {
      outcome.changes.forEach(c => this.applyChange(c))
    }
  }

  /** Aply a single change. */
  applyChange (change) {
    if (change.op === 'set') {
      this.qualities.set(
        change.quality,
        Object.fromEntries(
          ['quality', 'number', 'text']
            .map(k => {
              ;[k, change[k]]
            })
            .filter(([k, v]) => v != undefined)
        )
      )
    } else if (change.op === 'clear') {
      this.qualities.delete(change.quality)
    } else if (change.op === 'gain') {
      let quality = this.qualities.get(change.quality) ?? {
        quality: change.quality,
        number: 0
      }
      quality.number = (quality.number ?? 0) + change.amount
      this.qualities.set(change.quality, quality)
    } else if (change.op === 'lose') {
      let quality = this.qualities.get(change.quality) ?? {
        quality: change.quality,
        number: 0
      }
      quality.number = (quality.number ?? 0) - change.amount
      this.qualities.set(change.quality, quality)
    } else {
      throw new Error(`Invalid change: ${JSON.stringify(change)}`)
    }
  }

  /** Check if a choice's requirements are met. */
  requirementsMet (choice) {
    let reqs = choice.requirements ?? []
    return reqs.every(r => this.isMet(r))
  }

  /** Check if a single requirement is met. */
  isMet (req) {
    switch (req.pred) {
      // Numeric
      case 'eq':
        return (this.qualities.get(req.quality)?.number ?? 0) === req.value
      case 'neq':
        return (this.qualities.get(req.quality)?.number ?? 0) !== req.value
      case 'lt':
        return (this.qualities.get(req.quality)?.number ?? 0) < req.value
      case 'le':
        return (this.qualities.get(req.quality)?.number ?? 0) <= req.value
      case 'gt':
        return (this.qualities.get(req.quality)?.number ?? 0) > req.value
      case 'ge':
        return (this.qualities.get(req.quality)?.number ?? 0) >= req.value
      // Text
      case 'is':
        return (this.qualities.get(req.quality)?.text ?? '') === req.value
      case 'isnot':
        return (this.qualities.get(req.quality)?.text ?? '') !== req.value
      // Flag
      case 'set':
        return this.qualities.has(req.quality)
      case 'unset':
        return !this.qualities.has(req.quality)
    }
  }
}

// -------------------------------------------------------------------------
// ENTRYPOINT
function initialize (tale) {
  engine = new Engine(tale)
  setStorylet(engine.currentStorylet())
  initializeChoiceKeyListeners()
}
