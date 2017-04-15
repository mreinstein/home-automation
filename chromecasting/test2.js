'use strict'

const ChromecastAPI = require('chromecast-api')


const browser = new ChromecastAPI.Browser()

browser.on('deviceOn', function (device) {
  //const urlMedia = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4'
  const urlMedia = 'http://192.168.42.66:8000/La-La-Land.mp4'

  device.play(urlMedia, 0, function() {
    console.log('Playing in your chromecast')

    /*
    setTimeout(function () {
      //Pause the video
      device.pause(function () {
        console.log('Paused')
      })
    }, 20000)

    setTimeout(function () {
      //Stop video
      device.stop(function () {
        console.log('Stopped')
      })
    }, 30000)

    setTimeout(function () {
      //Close the streaming
      device.close(function () {
        console.log('Closed')
      })
    }, 40000)
    */
  })
})
