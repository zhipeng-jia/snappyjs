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
  var uncompressedBuffer = Buffer.alloc(text)
  var compressedBuffer = snappy.compressSync(uncompressedBuffer)
  target.uncompressedBuffer = uncompressedBuffer
  target.compressedBuffer = compressedBuffer
}

var text1, text2

function runBenchmark () {
  var data
  var suite = new Benchmark.Suite()
  suite.on('cycle', function (event) {
    console.log(String(event.target))
  })
  suite.add('node-snappy#compress', function () {
    var i
    if (data.repeatedTimes) {
      for (i = 0; i < data.repeatedTimes; i++) {
        snappy.compressSync(data.uncompressedBuffer)
      }
    } else {
      snappy.compressSync(data.uncompressedBuffer)
    }
  }).add('snappyjs#compress', function () {
    var i
    if (data.repeatedTimes) {
      for (i = 0; i < data.repeatedTimes; i++) {
        snappyjs.compress(data.uncompressedBuffer)
      }
    } else {
      snappyjs.compress(data.uncompressedBuffer)
    }
  }).add('node-snappy#uncompress', function () {
    var i
    if (data.repeatedTimes) {
      for (i = 0; i < data.repeatedTimes; i++) {
        snappy.uncompressSync(data.compressedBuffer)
      }
    } else {
      snappy.uncompressSync(data.compressedBuffer)
    }
  }).add('snappyjs#uncompress', function () {
    var i
    if (data.repeatedTimes) {
      for (i = 0; i < data.repeatedTimes; i++) {
        snappyjs.uncompress(data.compressedBuffer)
      }
    } else {
      snappyjs.uncompress(data.compressedBuffer)
    }
  })

  data = {}
  prepareData(data, text1)
  data.repeatedTimes = 100
  console.log(`Real text #1 (length ${text1.length}, byte length ${data.uncompressedBuffer.length}), repeated 100 times:`)
  suite.reset().run()
  console.log()

  data = {}
  prepareData(data, text2)
  data.repeatedTimes = 10
  console.log(`Real text #2 (length ${text2.length}, byte length ${data.uncompressedBuffer.length}), repeated 10 times:`)
  suite.reset().run()
  console.log()

  data = {}
  prepareData(data, randomString(1000000))
  data.repeatedTimes = 50
  console.log(`Random string (length 1000000, byte length ${data.uncompressedBuffer.length}), repeated 50 times:`)
  suite.reset().run()
  console.log()

  data = {}
  prepareData(data, randomString(100))
  data.repeatedTimes = 100000
  console.log(`Random string (length 100, byte length ${data.uncompressedBuffer.length}), repeated 100000 times:`)
  suite.reset().run()
  console.log()
}

Promise.coroutine(function * () {
  text1 = yield rp('https://raw.githubusercontent.com/idc9/stor390/master/notes/natural_language_processing/orwell_novels/1984.txt')
  text2 = yield rp('http://www.ecma-international.org/ecma-262/6.0/')
})().then(function () {
  runBenchmark()
})
