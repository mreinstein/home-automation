'use strict'

const Detector = require('snowboy').Detector
const Models   = require('snowboy').Models
const Polly    = require('aws-sdk/clients/polly').Presigner
const Speaker  = require('speaker')
const STT      = require('watson-developer-cloud/speech-to-text/v1')
const dotenv   = require('dotenv').config()
const https    = require('https')
const lifx     = require('node-lifx').Client
const record   = require('node-record-lpcm16')


const opts = {
  format: 'pcm',
  region: 'us-east-1',
  text: 'Ready!',
  voice: 'Joey',
  sampleRate: 16000
}

// http://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html
// pcm is in signed 16-bit, 1 channel (mono), little-endian format
// https://github.com/aws/aws-sdk-js/blob/master/clients/polly.d.ts#L237
const url = polly.getSynthesizeSpeechUrl({
  OutputFormat: opts.format,

  // Valid values for pcm are "8000" and "16000" The default value is "16000"
  SampleRate: opts.sampleRate.toString(),

  Text: opts.text,
  VoiceId: opts.voice
}, halfHourInSeconds)

const polly = new Polly({
  apiVersion: '2016-06-10',
  region: opts.region
})

const halfHourInSeconds = 30 * 60


const speaker = new Speaker({
  channels: 1,          // 2 channels 
  bitDepth: 16,         // 16-bit samples 
  sampleRate: opts.sampleRate,
  signed: true
});


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

  https.get(url, function(res) {
    res.pipe(speaker)
  })

  console.log('hotword', index, hotword)
  if(mode === 'IDLE') {
    console.log('READY')
    mode = 'LISTENING'

    const recognizerStream = speech_to_text.createRecognizeStream({ content_type: 'audio/l16; rate=16000', continuous: false })

    recognizerStream.on('error', function(event) {
      console.log('er', event)
      mode = 'IDLE'
    })

    recognizerStream.on('close', function(event) {
      mode = 'IDLE'
    })

    recognizerStream.on('data', function(data) {
      processInput(data.toString())
    })

    mic.pipe(recognizerStream).pipe(process.stdout)
  }
})


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
  console.log('new light found!', light.id)
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

