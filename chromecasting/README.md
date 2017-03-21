# experimentation around streaming video via chromecast

## serve a movie
```bash
node ./video-server.js
```

then play it:
```bash
node ./test2.js
```


## converting a movie file format:

ffmpeg needs aac installed:
```bash
brew install ffmpeg --with-fdk-aac
```


```
ffmpeg -i movie.avi movie.mp4
```