'use strict'

const Detector = require('snowboy').Detector
const Models   = require('snowboy').Models


// encapsulate snowboy setup boilerplate
module.exports = function snowboy() {
  const models = new Models()

  models.add({
    file: __dirname + '/../resources/stanley-mike-pi.pmdl',

    // Detection sensitivity controls how sensitive the detection is.
    // It is a value between 0 and 1. Increasing the sensitivity value
    // leads to better detection rate, but also higher false alarm rate.
    // It is an important parameter that you should play with in your
    sensitivity: '0.38',
    hotwords : 'stanley'
  })

  models.add({
    file: __dirname + '/../resources/stanley-heather-pi-2.pmdl',
    sensitivity: '0.38',
    hotwords : 'stanley'
  })

  return new Detector({
    resource: __dirname + '/../resources/common.res',
    models: models,

    // audioGain controls whether to increase (>1) or decrease (<1) input volume.
    audioGain: 1.0
  })
}
