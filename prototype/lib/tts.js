'use strict'

const Polly        = require('aws-sdk/clients/polly').Presigner
const Speaker      = require('speaker')
//const fs           = require('fs')
const getVoiceName = require('./get-voice-name')
const https        = require('https')


const polly = new Polly({
  apiVersion: '2016-06-10',
  region: process.env.AWS_REGION
})


function getPollyTTSURL(text) {
  const halfHourInSeconds = 30 * 60
  const pollyVoice = getVoiceName()

  // http://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html

  // pcm is in signed 16-bit, 1 channel (mono), little-endian format
  // https://github.com/aws/aws-sdk-js/blob/master/clients/polly.d.ts#L237
  return polly.getSynthesizeSpeechUrl({
    OutputFormat: 'pcm', // mp3, pcm

    // Valid values for pcm are "8000" and "16000" The default value is "16000"
    // 22050 for mp3
    SampleRate: '16000',

    Text: text,
    VoiceId: pollyVoice
  }, halfHourInSeconds)
}


module.exports = async function tts(text) {
  return new Promise(function(resolve, reject) {
    let ttsURL = getPollyTTSURL(text)
    https.get(ttsURL, function(res) {
      const speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 16000,
        signed: true
      })

      speaker.on('close', function() {
        resolve()
      })
      //fs.createReadStream(__dirname + '/../resources/1.wav').pipe(speaker)
      res.pipe(speaker)
    })
  })
}
