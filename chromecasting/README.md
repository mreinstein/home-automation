experimentation around streaming video via chromecast

casting a movie:
```
./node_modules/castnow/index.js public/movie.mp4
```

ffmpeg needs aac installed:
```bash
brew install ffmpeg --with-fdk-aac
```

converting a movie file format:
```
ffmpeg -i movie.avi movie.mp4
```