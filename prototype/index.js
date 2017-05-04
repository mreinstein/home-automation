'use strict'

const STT      = require('watson-developer-cloud/speech-to-text/v1')
const dotenv   = require('dotenv').config()
const lifx     = require('node-lifx').Client
const moment   = require('moment')
const record   = require('node-record-lpcm16')
const snowboy  = require('./lib/snowboy')
const state    = require('./lib/async-finite-state-machine')
const tts      = require('./lib/tts')
const weather  = require('./lib/weather')


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
      if(isMicrophoneError(error)) {
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
      if(isMicrophoneError(error)) {
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

  let _processInput = async function(data) {
    data = data.toString().trim().toUpperCase()
    if(data.length === 0) return

    console.log('command:', data)

    if(lights.length === 0) return

    if(isCommand(data, [ 'EVENING LIGHT', 'SOFT LIGHT'] )) {
      setColor(lights[0], 29, 100, 50, 3500, 1000)
    } else if(data.indexOf('READING LIGHT') > -1) {
      setColor(lights[0], 0, 0, 65, 2500, 1000)
    } else if(isCommand(data, morning_commands)) {
      setColor(lights[0], 202, 100, 40, 3500, 60000)
    } else if(isCommand(data, off_commands)) {
      lights[0].off(600)
    } else if (isCommand(data, on_commands)) {
      lights[0].on(1200)
    } else if(isCommand(data, [ 'LIGHT', 'LIGHTS', 'LET\'S', 'LETS', 'PLATES' ] )) {
      toggleLight(lights[0], 800)
    } else if (data === 'I LOVE YOU') {
      tts('I love you too!')
    } else if (isCommand(data, [ 'WHAT\'S TODAY', 'WHAT IS TODAY', 'WHAT DAY IS IT' ])) {
      tts('Today is ' + moment().format('dddd, MMMM Do'))
    } else if (isCommand(data, [ 'WHAT\'S THE TIME', 'WHAT TIME IS IT' ])) {
      tts("It's " + moment().format('h:mm a'))
    } else if (isCommand(data, ['WHAT IS THE DATE', 'WHAT\'S THE DATE'])) {
      tts(moment().format('dddd, MMMM Do'))  //dddd, MMMM Do YYYY
    } else if (data.indexOf('WEATHER') >= 0) {
      tts(await weather({ postal: process.env.POSTAL_CODE }))
    } else if(data.indexOf('NAP') >= 0) {
      if(data.indexOf('CANCEL') >= 0) {
        cancelNap()
      } else {
        await take20MinuteNap()
      }
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


// determine if stderror output from sox or arecord are real errors
// and not simply a harmless warning
function isMicrophoneError(error) {
  // for example, sox prints this to stderr, but it's just a warning:
  // rec WARN wav: Length in output .wav header will be wrong since can't seek to fix it
  return error.toLowerCase().indexOf('fail') >= 0 ||
    error.toLowerCase().indexOf('error') >= 0
}


function awaitingMicrophoneState() {
  let _acquireMicrophone = async function() {
    return new Promise(function(resolve, reject) {
      record.start({
        threshold: 0,
        verbose: false
      })
      .on('error', function(error) {
        if(isMicrophoneError(error)) {
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

      await sleep(1000)
    }

    fsm.setState('IDLE')
  }

  return Object.freeze({ enter })
}


async function take20MinuteNap() {
  if(napTimer) {
    // nap is already set
    return
  }
  await tts('Okay, I will wake you up in twenty minutes')

  napTimer = setTimeout(function() {
    tts(`It's ${moment().format('h:mm a')}. Time to wake up! Rise and shine, up and at 'em`)
    napTimer = undefined
  }, 20 * 60 * 1000)
}

function cancelNap() {
  if(!napTimer) {
    return
  }

  clearTimeout(napTimer)
  napTimer = undefined
  tts('The nap has been cancelled.')
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

let napTimer

const fsm = state()
fsm.addState('AWAITING-MICROPHONE', awaitingMicrophoneState())
fsm.addState('IDLE', idleState())
fsm.addState('LISTENING', listeningState())
fsm.addState('RECORDING', recordingState())

fsm.setState('AWAITING-MICROPHONE')
