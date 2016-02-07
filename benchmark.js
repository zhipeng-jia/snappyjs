// The MIT License (MIT)
//
// Copyright (c) 2016 Zhipeng Jia
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict'

var snappy = require('snappy')
var snappyjs = require('./index')
var Benchmark = require('benchmark')
var Promise = require('bluebird')
var rp = require('request-promise')

function stringToArrayBuffer (source) {
  var array_buffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(array_buffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return array_buffer
}

function bufferToArrayBuffer (buffer) {
  var array_buffer = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(array_buffer)
  var i
  for (i = 0; i < buffer.length; i++) {
    view[i] = buffer[i]
  }
  return array_buffer
}

function randomString (length) {
  var result = ''
  var i, code
  for (i = 0; i < length; i++) {
    code = Math.floor(Math.random() * 256)
    result += String.fromCharCode(code)
  }
  return result
}

function prepareData (target, text) {
  var uncompressed_array_buffer = stringToArrayBuffer(text)
  var uncompressed_buffer = new Buffer(uncompressed_array_buffer)
  var compressed_buffer = snappy.compressSync(uncompressed_buffer)
  var compressed_array_buffer = bufferToArrayBuffer(compressed_buffer)
  target.uncompressedArrayBuffer = uncompressed_array_buffer
  target.uncomprssedBuffer = uncompressed_buffer
  target.compressedArrayBuffer = compressed_array_buffer
  target.compressedBuffer = compressed_buffer
}

var text1, text2

function runBenchmark () {
  var data
  var suite = new Benchmark.Suite()
  suite.on('cycle', function (event) {
    console.log(String(event.target))
  })
  suite.add('node-snappy#compress', function () {
    snappy.compressSync(data.uncomprssedBuffer)
  }).add('snappyjs#compress', function () {
    snappyjs.compress(data.uncompressedArrayBuffer)
  }).add('node-snappy#uncompress', function () {
    snappy.uncompressSync(data.compressedBuffer)
  }).add('snappyjs#uncompress', function () {
    snappyjs.uncompress(data.compressedArrayBuffer)
  })

  data = {}
  prepareData(data, text1)
  console.log(`Real text #1 (length ${text1.length}, byte length ${text1.length * 2}):`)
  suite.reset().run()
  console.log()

  data = {}
  prepareData(data, text2)
  console.log(`Real text #2 (length ${text2.length}, byte length ${text2.length * 2}):`)
  suite.reset().run()
  console.log()

  data = {}
  prepareData(data, randomString(1000000))
  console.log('Random string (length 1000000, byte length 2000000):')
  suite.reset().run()
  console.log()
}

Promise.coroutine(function * () {
  text1 = yield rp('http://msxnet.org/orwell/print/1984.tex')
  text2 = yield rp('http://www.ecma-international.org/ecma-262/6.0/')
})().then(function () {
  runBenchmark()
})
