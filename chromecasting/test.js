'use strict'

// this is the module that powers castnow under the hood
// I'm currently not a big fan of this at it seems a bit complex
// and bloated, with it's own plugin system.
const player = require('chromecast-player')()


const media = 'http://10.0.0.116:8000/marnie.mp4'

player.launch(media, function(err, p) {
  console.log('launch', err)
  p.once('playing', function() {
    console.log('playback has started.')
  })
})
