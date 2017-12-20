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


// @param string OutputFormat   should be mp3 or pcm. defaults to mp3
function getPollyTTSURL(Text, OutputFormat) {
  if(OutputFormat !== 'pcm')
    OutputFormat = 'mp3'

  // Valid values for pcm are '8000' and '16000' The default value is '16000'
  // The default value is '22050' for mp3
  const SampleRate = (OutputFormat === 'mp3') ? '22050' : '16000'
  const halfHourInSeconds = 30 * 60
  const TextType = Text.indexOf('<speak>') < 0 ? 'text' : 'ssml'

  // http://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html

  // pcm is in signed 16-bit, 1 channel (mono), little-endian format
  // https://github.com/aws/aws-sdk-js/blob/master/clients/polly.d.ts#L237
  return polly.getSynthesizeSpeechUrl({
    OutputFormat,
    SampleRate,
    Text,
    VoiceId: getVoiceName()
  }, halfHourInSeconds)
}


module.exports = async function tts(text) {
  return new Promise(function(resolve, reject) {
    let ttsURL = getPollyTTSURL(text, 'pcm')
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
