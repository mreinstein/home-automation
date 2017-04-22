# experimentation around streaming video via chromecast

## serve a movie
```bash
node ./video-server.js
```

then play it:
```bash
node ./cast.js
```


## converting a movie file format:

ffmpeg needs aac installed:
```bash
brew install ffmpeg --with-fdk-aac
```

```
ffmpeg -i movie.avi movie.mp4
```


## potentially interesting integrations

* https://www.npmjs.com/package/movie-trailer
* https://www.npmjs.com/package/movie-api
* https://www.npmjs.com/package/movie-info
* https://www.npmjs.com/package/movie-art
* https://www.npmjs.com/package/movie-list
* https://www.npmjs.com/package/omdb
* https://www.npmjs.com/package/moviedb
