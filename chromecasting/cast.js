'use strict'

const ChromecastAPI = require('chromecast-api')


const browser = new ChromecastAPI.Browser()

browser.on('deviceOn', function (device) {
  // can use this format to stream a video right from the internet
  //const urlMedia = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4'

  // streaming from the local media server
  const urlMedia = 'http://192.168.42.74:8000/superman.mp4'

  device.play(urlMedia, 0, function() {
    console.log(`casting ${urlMedia}`)

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
