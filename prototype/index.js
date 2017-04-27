'use strict'

const STT      = require('watson-developer-cloud/speech-to-text/v1')
const dotenv   = require('dotenv').config()
const lifx     = require('node-lifx').Client
const record   = require('node-record-lpcm16')
const snowboy  = require('./lib/snowboy')
const state    = require('./lib/async-finite-state-machine')
const tts      = require('./lib/tts')


function idleState() {
  let detector

  let enter = async function() {

    detector = snowboy()

    /*
    detector.on('error', function (er) {
      console.log('snowboy error', er)
    })*/

    detector.on('hotword', async function(index, hotword) {
      console.log('hotword', index, hotword)
      await fsm.setState('LISTENING')
    })

    await sleep(500)

    record.start({
      threshold: 0,
      verbose: false
    })
    .on('error', function(error) {
      if(error.toLowerCase().trim().indexOf('warn') < 0) {
        // this was not a warning, the record stream failed
        fsm.setState('AWAITING-MICROPHONE')
      }
    })
    .pipe(detector)
  }

  let exit = function() {
    record.stop()
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
    recognizerStream = speech_to_text.createRecognizeStream({ content_type: 'audio/l16; rate=16000', continuous: true, inactivity_timeout: 2 })

    recognizerStream.on('error', function(event) {
      //console.error('er', event)
    })

    recognizerStream.on('close', async function(event) {
      console.log('\nWatson speech socket closed')

      fsm.setState('IDLE')
    })

    recognizerStream.on('data', _processInput)

    record.start({
      threshold: 0,
      verbose: false
    })
    .on('error', function(error) {
      if(error.toLowerCase().trim().indexOf('warn') < 0) {
        // this was not a warning, the record stream failed
        fsm.setState('AWAITING-MICROPHONE')
      }
    })
    .pipe(recognizerStream)
  }

  let exit = function() {
    record.stop()
    recognizerStream.removeListener('data', _processInput)
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
    } else if(data === 'LIGHT' || data === 'LIGHTS' || data === 'LET\'S' || data === 'LETS') {
      toggleLight(lights[0], 800)
    }
  }

  return Object.freeze({ enter, exit })
}


async function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms)
  })
}

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


function listeningState() {
  const choices = [ 'Acknowledged.', 'At your service.', 'Hiya.', 'Yes?' ]

  let enter = async function() {
    const conf = choices[Math.floor(Math.random() * choices.length)]
    await tts(conf)
    fsm.setState('RECORDING')
  }

  return Object.freeze({ enter })
}


function awaitingMicrophoneState() {
  let _acquireMicrophone = async function() {
    return new Promise(function(resolve, reject) {
      record.start({
        threshold: 0,
        verbose: false
      })
      .on('error', function(error) {
        if(error.toLowerCase().trim().indexOf('warn') < 0) {
          // this was not a warning, the record stream failed
          reject(error)
        }
      })
      .on('readable', function() {
        record.stop()
        resolve()
      })
    })
  }

  // poll until microphone becomes available
  let enter = async function() {
    let available = false
    while(!available) {
      try {
        await _acquireMicrophone()
        available = true
      } catch(err) { }

      await sleep(2000)
    }
    fsm.setState('IDLE')
  }

  return Object.freeze({ enter })
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

const lights = []
const client = new lifx()

client.on('light-new', function(light) {
  lights.push(light)
  console.log('new light found!', light.id)
})

client.init()


const fsm = state()
fsm.addState('AWAITING-MICROPHONE', awaitingMicrophoneState())
fsm.addState('IDLE', idleState())
fsm.addState('LISTENING', listeningState())
fsm.addState('RECORDING', recordingState())

fsm.setState('AWAITING-MICROPHONE')
