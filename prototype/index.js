'use strict'

const Detector = require('snowboy').Detector
const Models   = require('snowboy').Models
const STT      = require('watson-developer-cloud/speech-to-text/v1')
const dotenv   = require('dotenv').config()
const lifx     = require('node-lifx').Client
const record   = require('node-record-lpcm16')
const state    = require('./lib/finite-state-machine')
const tts      = require('./lib/tts')


function isCommand(input, commands) {
  for(let i=0; i < commands.length; i++) {
   if (input.indexOf(commands[i]) > -1)
     return true
  }
  return false
}


function setColor(light, hue, saturation, brightness, kelvin=3500, duration=0) {
  light.getPower(function(error, data) {
    console.log('power:', data)
    if(data === 0) {
      light.color(hue, saturation, brightness, kelvin)
      setTimeout(function(){
        light.on(duration)
      }, 1200)
    } else {
      light.color(hue, saturation, brightness, kelvin, duration)
    }
  })
}


function toggleLight(light, duration=0) {
  light.getPower(function(error, data) {
    if(data === 0) {
      light.on(duration)
    } else {
      light.off(duration)
    }
  })
}


function idleState() {
  let mic
  const models = new Models()

  models.add({
    file: __dirname + '/resources/stanley-mike.pmdl',

    // Detection sensitivity controls how sensitive the detection is.
    // It is a value between 0 and 1. Increasing the sensitivity value
    // leads to better detection rate, but also higher false alarm rate.
    // It is an important parameter that you should play with in your 
    sensitivity: '0.5',
    hotwords : 'stanley'
  })

  models.add({
    file: __dirname + '/resources/stanley-heather.pmdl',
    sensitivity: '0.5',
    hotwords : 'stanley'
  })

  const detector = new Detector({
    resource: __dirname + '/resources/common.res',
    models: models,

    // audioGain controls whether to increase (>1) or decrease (<1) input volume.
    audioGain: 2.0
  })

  detector.on('error', function (er) {
    console.log('snowboy error', er)
  })

  detector.on('hotword', async function(index, hotword) {
    console.log('hotword', index, hotword)
    fsm.setState('LISTENING')
  })

  let enter = function() {
    mic = record.start({
      threshold: 0,
      verbose: false
    })

    mic.pipe(detector)
  }

  let exit = function() {
    record.stop()
    mic.unpipe(detector)
  }

  return Object.freeze({ enter, exit })
}


function listeningState() {
  let enter = async function() {
    await tts('Ready.')
    fsm.setState('RECORDING')
  }

  let exit = function() {

  }

  return Object.freeze({ enter, exit })
}


function recordingState() {
  let recognizerStream, text, mic

  const speech_to_text = new STT({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD
  })

  let enter = async function() {
    mic = record.start({
      threshold: 0,
      verbose: false
    })

    recognizerStream = speech_to_text.createRecognizeStream({ content_type: 'audio/l16; rate=16000', continuous: true, inactivity_timeout: 1 })

    recognizerStream.on('error', function(event) {
      //console.log('er', event)
    })

    recognizerStream.on('close', async function(event) {
      console.log('\nWatson speech socket closed')

      fsm.setState('IDLE')
    })
    
    recognizerStream.on('data', _processInput)
    mic.pipe(recognizerStream)
  }

  let exit = function() {
    recognizerStream.removeListener('data', _processInput)
    record.stop()
    mic.unpipe(recognizerStream)
    recognizerStream = undefined
  }

  let _processInput = function(data) {
    data = data.toString().trim().toUpperCase()
    if(data.length === 0) return

    console.log('command:', data)

    if(lights.length === 0) return

    if(data.indexOf('EVENING LIGHT') > -1) {
      setColor(lights[0], 29, 100, 50, 3500, 1000)
    } else if(data.indexOf('READING LIGHT') > -1) {
      setColor(lights[0], 0, 0, 65, 2500, 1000)
    } else if(isCommand(data, morning_commands)) {
      setColor(lights[0], 202, 100, 40, 3500, 60000)
    } else if(isCommand(data, off_commands)) {
      console.log('lights off')
      lights[0].off(600)
    } else if (isCommand(data, on_commands)) {
      lights[0].on(1200)
      console.log('lights on')
    } else if(data === 'LIGHT' || data === 'LIGHTS') {
      toggleLight(lights[0], 800)
    }
  }

  return Object.freeze({ enter, exit })
}


// playing a shoutcast station
//mpg123 -C http://206.190.150.90:8301/stream

const off_commands = [
  'LIGHTS OFF',
  'LIGHTS OUT',
  'GOOD NIGHT',
  'SLEEPY TIME',
  'LIGHT OFF',
  'LIGHT OUT'
]

const on_commands = [
  'LIGHTS ON',
  'LIGHT ON'
]

const morning_commands = [
  'GOOD MORNING',
  'MORNING'
]

let lights = []
let client = new lifx()

client.on('light-new', function(light) {
  lights.push(light)
  console.log('new light found!', light.id)
})

client.init()

const fsm = state()
fsm.addState('IDLE', idleState())
fsm.addState('LISTENING', listeningState())
fsm.addState('RECORDING', recordingState())

fsm.setState('IDLE')
