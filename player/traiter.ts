import { Engine, BasicEngine, BasicEngineArgs } from "./engine";
import * as storylet from "../storylet";

let activeChoice: number, engine: Engine;

// -------------------------------------------------------------------------
// TEMPLATES/UI

function choice(choice: storylet.Choice, idx: number): HTMLElement {
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

function storyletContent(storylet: storylet.Storylet): Array<HTMLElement> {
  const body = document.createElement('div')
  body.classList.add('traiter-storylet-body')
  body.innerHTML = storylet.body

  const choices = storylet.choices.map(choice)

  return [body, ...choices]
}

function outcomeContent(outcome: storylet.Outcome): Array<HTMLElement> {
  const body = document.createElement('div')
  body.classList.add('traiter-outcome')
  body.innerHTML = outcome.body

  // TODO display changes

  const next = document.createElement('button')
  next.innerText = 'Continue'
  next.addEventListener('click', () => continueToStorylet())

  return [body, next]
}

function requirements(reqs: ReadonlyArray<storylet.Requirement>): HTMLElement {
  const element = document.createElement('div')
  element.classList.add('traiter-requirements')

  if (reqs.length > 0) {
    const list = document.createElement('ul')
    list.replaceChildren(...reqs.map(requirement))
    element.replaceChildren('Requires:', list)
  }

  return element
}

function requirement(req: storylet.Requirement): HTMLElement {
  const li = document.createElement('li')
  if (req.pred === "set" || req.pred === "unset") {
    li.innerText = `"${req.quality}" must be  ${req.pred}`
  } else {
    li.innerText = `"${req.quality}" ${req.pred} ${req.value ?? ''}`
  }
  return li
}

// -------------------------------------------------------------------------
// State Management

function setStorylet(storylet: storylet.Storylet): void {
  const target = document.getElementById('traiter-main') as HTMLElement
  target.classList.replace('traiter-outcome', 'traiter-storylet')
  const newContent = storyletContent(storylet)
  target.replaceChildren(...newContent)
  focusFirstChoice()
}

function setOutcome(outcome: storylet.Outcome): void {
  const target = document.getElementById('traiter-main') as HTMLElement
  target.classList.replace('traiter-storylet', 'traiter-outcome')
  const newContent = outcomeContent(outcome)
  target.replaceChildren(...newContent)
  const startFocus = target.children[1] as HTMLElement
  startFocus.focus()
}

function takeChoice(idx: number): void {
  let outcome = engine.takeChoice(idx)
  if (outcome == undefined) {
    return
  }
  setOutcome(outcome)
}

function continueToStorylet() {
  setStorylet(engine.currentStorylet())
}

function focusNextChoice() {
  console.info('focus next')
  const choices = document.getElementsByClassName('traiter-choice-button')

  if (activeChoice != undefined) {
    const next = choices[activeChoice + 1] as HTMLElement
    if (next !== undefined) {
      activeChoice = activeChoice + 1
      next.focus()
    }
  } else {
    focusFirstChoice()
  }
}

function focusFirstChoice() {
  activeChoice = 0
  const firstChoice = document.getElementsByClassName('traiter-choice-button')[0]
  if (firstChoice != undefined) {
    (firstChoice as HTMLElement).focus()
  }
}

function focusPrevChoice() {
  console.info('focus prev')
  const choices = document.getElementsByClassName('traiter-choice-button')
  if (activeChoice != undefined) {
    const prev = choices[activeChoice - 1] as HTMLElement
    if (prev !== undefined) {
      activeChoice = activeChoice - 1
      prev.focus()
    }
  } else {
    // If focus isn't on the choice list, focus the last element.
    focusLast()
  }
}

function focusLast() {
  const choices = document.getElementsByClassName('traiter-choice-button')
  activeChoice = choices.length - 1
  const choice = choices[choices.length - 1] as HTMLElement
  choice.focus()
}

function initializeChoiceKeyListeners() {
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
// ENTRYPOINT
export function start(args: BasicEngineArgs): void {
  engine = new BasicEngine(args)
  setStorylet(engine.currentStorylet())
  initializeChoiceKeyListeners()
}
