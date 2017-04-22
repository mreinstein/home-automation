'use strict'

// exposes an http streaming video server
// Inspired by http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js

const http = require('http'),
    fs = require('fs'),
    mime = require('mime'),
    path = require('path'),
    rangeParser = require('range-parser'),
    url = require('url'),
    util = require('util')


const port = 8000
const mediaPath = '/home/pi/media'

http.createServer(function (req, res) {
  // TODO: sanitize req.url to avoid exposing operating system
  // https://nodejs.org/dist/latest-v7.x/docs/api/http.html#http_message_url
  const { pathname } = url.parse(req.url)

  const filePath = path.resolve(mediaPath, pathname.substring(1))

  if (!fs.existsSync()) {
    res.writeHead(404)
    res.send('file not found')
    return
  }
  console.log('file to play:', filePath)
  const stat = fs.statSync(filePath)
  const total = stat.size
  const type = mime.lookup(filePath) // 'video/mp4'

  if (req.headers['range']) {
    const part = rangeParser(total, req.headers.range)[0]

    const chunksize = (part.end - part.start) + 1

    console.log('RANGE: ' + part.start + ' - ' + part.end + ' = ' + chunksize)

    const file = fs.createReadStream(filePath, {start: part.start, end: part.end})

    res.writeHead(206, {
      'Content-Range': 'bytes ' + part.start + '-' + part.end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': type,
      'Access-Control-Allow-Origin': '*'
    })

    file.pipe(res)
  } else {
    console.log('ALL: ' + total)
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': type })
    fs.createReadStream(filePath).pipe(res)
  }
}).listen(port)
console.log(`Streaming video server running at http://127.0.0.1:${port}`)
