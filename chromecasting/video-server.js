'use strict'

/*
 * Inspired by: http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js
 */

const http = require('http'),
    fs = require('fs'),
    mime = require('mime'),
    rangeParser = require('range-parser'),
    util = require('util')


http.createServer(function (req, res) {
  const filePath = __dirname + '/public/shadow-of-a-doubt.mp4'
  //var filePath = '/Users/michaelreinstein/Movies/raw/title00.mkv'
  const stat = fs.statSync(filePath)
  const total = stat.size
  const type = mime.lookup(filePath)

  if (req.headers['range']) {
    const part = rangeParser(total, req.headers.range)[0]

    console.log('RANGE: ' + part.start + ' - ' + part.end + ' = ' + chunksize)

    const chunksize = (part.end - part.start) + 1
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
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' })
    fs.createReadStream(path).pipe(res)
  }
}).listen(8000)
console.log('Server running at http://127.0.0.1:8000/')
