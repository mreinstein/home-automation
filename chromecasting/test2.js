var ChromecastAPI = require('chromecast-api')
 
 
var browser = new ChromecastAPI.Browser()
 
browser.on('deviceOn', function (device) {
    //var urlMedia = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
    var urlMedia = 'http://10.0.0.116:8000/marnie.mp4';
 
    device.play(urlMedia, 0, function () {
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
 
