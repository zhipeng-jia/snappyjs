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

var test = require('tap').test

var snappy = require('snappy')
var snappyjs = require('./index')

var fs = require('fs')
var textrandomInputString = fs.readFileSync('snappy_compressor.js', 'utf8')

function bufferToUint8Array (buffer) {
  return new Uint8Array(buffer)
}

function bufferToArrayBuffer (buffer) {
  var arrayBuffer = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(arrayBuffer)
  var i
  for (i = 0; i < buffer.length; i++) {
    view[i] = buffer[i]
  }
  return arrayBuffer
}

function uint8ArrayToBuffer (uint8Array) {
  var buffer = Buffer.alloc(uint8Array.length)
  var i
  for (i = 0; i < uint8Array.length; i++) {
    buffer[i] = uint8Array[i]
  }
  return buffer
}

function arrayBufferToBuffer (arrayBuffer) {
  var view = new Uint8Array(arrayBuffer)
  var buffer = Buffer.alloc(view.length)
  var i
  for (i = 0; i < view.length; i++) {
    buffer[i] = view[i]
  }
  return buffer
}

function stringToUint8Array (source) {
  var arrayBuffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(arrayBuffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return new Uint8Array(arrayBuffer)
}

function stringToArrayBuffer (source) {
  var arrayBuffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(arrayBuffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return arrayBuffer
}

function uint8ArrayToString (uint8Array) {
  var view = new Uint16Array(uint8Array.buffer)
  var result = ''
  var i
  for (i = 0; i < view.length; i++) {
    result += String.fromCharCode(view[i])
  }
  return result
}

function arrayBufferToString (arrayBuffer) {
  var view = new Uint16Array(arrayBuffer)
  var result = ''
  var i
  for (i = 0; i < view.length; i++) {
    result += String.fromCharCode(view[i])
  }
  return result
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

test('compress() normal text using Uint8Array', function (t) {
  var compressed = snappyjs.compress(stringToUint8Array(textrandomInputString))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('compress() normal text using ArrayBuffer', function (t) {
  var compressed = snappyjs.compress(stringToArrayBuffer(textrandomInputString))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('compress() normal text using Buffer', function (t) {
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(textrandomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('uncompress() normal text using Uint8Array', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(textrandomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToUint8Array(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = uint8ArrayToString(uncompressed)
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('uncompress() normal text using ArrayBuffer', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(textrandomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToArrayBuffer(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = arrayBufferToString(uncompressed)
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('uncompress() normal text using Buffer', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(textrandomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, textrandomInputString)
  t.end()
})

test('compress() random string of length 100000 using Uint8Array', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappyjs.compress(stringToUint8Array(randomInputString))
  compressed = uint8ArrayToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('compress() random string of length 100000 using ArrayBuffer', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappyjs.compress(stringToArrayBuffer(randomInputString))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('compress() random string of length 100000 using Buffer', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(randomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('compress() random string of length 100 using Uint8Array', function (t) {
  var randomInputString = randomString(100)
  var compressed = snappyjs.compress(stringToUint8Array(randomInputString))
  compressed = uint8ArrayToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('compress() random string of length 100 using ArrayBuffer', function (t) {
  var randomInputString = randomString(100)
  var compressed = snappyjs.compress(stringToArrayBuffer(randomInputString))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('compress() random string of length 100 using Buffer', function (t) {
  var randomInputString = randomString(100)
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(randomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('uncompress() random string of length 100000 using Uint8Array', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(randomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToUint8Array(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = uint8ArrayToString(uncompressed)
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('uncompress() random string of length 100000 using ArrayBuffer', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(randomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToArrayBuffer(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = arrayBufferToString(uncompressed)
  t.equal(uncompressedString, randomInputString)
  t.end()
})

test('uncompress() random string of length 100000 using Buffer', function (t) {
  var randomInputString = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(randomInputString)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressedString = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressedString, randomInputString)
  t.end()
})
