'use strict'

module.exports = function fsm() {
  const states = {}
  let currentState

  let addState = function(stateName, state) {
    states[stateName] = state
  }

  let setState = async function(stateName, ...args) {
    if (stateName === currentState) {
      return // already in the state
    }

    if (!states[stateName]) {
      return // new state doesn't exist
    }

    if (currentState) {
      console.log('exiting state', currentState)
      if(states[currentState].exit)
        await states[currentState].exit()
    }

    console.log('entering state', stateName)
    currentState = stateName
    await states[currentState].enter(...args)
  }

  return Object.freeze({ addState, setState })
}
