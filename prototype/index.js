'use strict'

const Detector = require('snowboy').Detector
const Models   = require('snowboy').Models
const STT      = require('watson-developer-cloud/speech-to-text/v1')
const dotenv   = require('dotenv').config()
const lifx     = require('node-lifx').Client
//const mic    = require('mic')
const record   = require('node-record-lpcm16')


const speech_to_text = new STT({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD
})

const models = new Models()

models.add({
  file: __dirname + '/stanley-mike.pmdl',
  sensitivity: '0.5',
  hotwords : 'stanley'
})

models.add({
  file: __dirname + '/stanley-heather.pmdl',
  sensitivity: '0.5',
  hotwords : 'stanley'
})

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: 2.0
})

const mic = record.start({
  threshold: 0,
  verbose: false
})

mic.pipe(detector)

let mode = 'IDLE'

detector.on('error', function () {
  console.log('error')
})

detector.on('hotword', function (index, hotword) {
  console.log('hotword', index, hotword)
  if(mode === 'IDLE') {
    console.log('READY')
    mode = 'LISTENING'

    const recognizerStream = speech_to_text.createRecognizeStream({ content_type: 'audio/l16; rate=16000', continuous: false })

    recognizerStream.on('error', function(event) {
      console.log('er', event)
    })

    recognizerStream.on('close', function(event) {
      mode = 'IDLE'
      console.log('FIN')
    })

    recognizerStream.on('data', function(data) {
      processInput(data.toString())
    })

    mic.pipe(recognizerStream).pipe(process.stdout)
  }
})


/*
const micInstance = mic({ 'rate': '16000', 'channels': '1', 'debug': false, 'exitOnSilence': 2 })
const micInputStream = micInstance.getAudioStream()

const recognizerStream = speech_to_text.createRecognizeStream({ content_type: 'audio/l16; rate=16000' })


micInputStream.on('processExitComplete', function() {
  console.log("Got SIGNAL processExitComplete")
})

micInputStream.on('stopComplete', function() {
  console.log("Got SIGNAL stopComplete");
})

micInputStream.on('silence', function() {
  console.log("Got SIGNAL silence");
})

micInputStream.on('pauseComplete', function() {
  console.log("Got SIGNAL pauseComplete");
  setTimeout(function() {
    micInstance.resume()
  }, 5000)
})


micInputStream.on('error', function(err) {
  cosole.log("Error in Input Stream: " + err)
})

micInputStream.on('end', function() {
  cosole.log("End stream: ")
})


micInputStream
  .pipe(recognizerStream)
  .pipe(process.stdout)

micInstance.start()
*/


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

function isCommand(input, commands) {
  for(let i=0; i < commands.length; i++) {
   if (input.indexOf(commands[i]) > -1)
     return true
  }
  return false
}

let lights = []
let client = new lifx()

client.on('light-new', function(light) {
  lights.push(light)
  console.log('new light found!', light)
})

client.init()

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

function processInput(data) {
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

