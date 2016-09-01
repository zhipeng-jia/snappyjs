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
var input_string = fs.readFileSync('snappy_compressor.js', 'utf8')

function bufferToUint8Array (buffer) {
  return new Uint8Array(buffer)
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

function uint8ArrayToBuffer (uint8Array) {
  var buffer = new Buffer(uint8Array.length)
  var i
  for (i = 0; i < uint8Array.length; i++) {
    buffer[i] = uint8Array[i]
  }
  return buffer
}

function arrayBufferToBuffer (array_buffer) {
  var view = new Uint8Array(array_buffer)
  var buffer = new Buffer(view.length)
  var i
  for (i = 0; i < view.length; i++) {
    buffer[i] = view[i]
  }
  return buffer
}

function stringToUint8Array (source) {
  var array_buffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(array_buffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return new Uint8Array(array_buffer)
}

function stringToArrayBuffer (source) {
  var array_buffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(array_buffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return array_buffer
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

function arrayBufferToString (array_buffer) {
  var view = new Uint16Array(array_buffer)
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
  var compressed = snappyjs.compress(stringToUint8Array(input_string))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('compress() normal text using ArrayBuffer', function (t) {
  var compressed = snappyjs.compress(stringToArrayBuffer(input_string))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('compress() normal text using Buffer', function (t) {
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(input_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('uncompress() normal text using Uint8Array', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(input_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToUint8Array(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = uint8ArrayToString(uncompressed)
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('uncompress() normal text using ArrayBuffer', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(input_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToArrayBuffer(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = arrayBufferToString(uncompressed)
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('uncompress() normal text using Buffer', function (t) {
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(input_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, input_string)
  t.end()
})

test('compress() random string of length 100000 using Uint8Array', function (t) {
  var random_string = randomString(100000)
  var compressed = snappyjs.compress(stringToUint8Array(random_string))
  compressed = uint8ArrayToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('compress() random string of length 100000 using ArrayBuffer', function (t) {
  var random_string = randomString(100000)
  var compressed = snappyjs.compress(stringToArrayBuffer(random_string))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('compress() random string of length 100000 using Buffer', function (t) {
  var random_string = randomString(100000)
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(random_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('compress() random string of length 100 using Uint8Array', function (t) {
  var random_string = randomString(100)
  var compressed = snappyjs.compress(stringToUint8Array(random_string))
  compressed = uint8ArrayToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('compress() random string of length 100 using ArrayBuffer', function (t) {
  var random_string = randomString(100)
  var compressed = snappyjs.compress(stringToArrayBuffer(random_string))
  compressed = arrayBufferToBuffer(compressed)
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('compress() random string of length 100 using Buffer', function (t) {
  var random_string = randomString(100)
  var compressed = snappyjs.compress(arrayBufferToBuffer(stringToArrayBuffer(random_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappy.uncompressSync(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('uncompress() random string of length 100000 using Uint8Array', function (t) {
  var random_string = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(random_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToUint8Array(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = uint8ArrayToString(uncompressed)
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('uncompress() random string of length 100000 using ArrayBuffer', function (t) {
  var random_string = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(random_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  compressed = bufferToArrayBuffer(compressed)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = arrayBufferToString(uncompressed)
  t.equal(uncompressed_string, random_string)
  t.end()
})

test('uncompress() random string of length 100000 using Buffer', function (t) {
  var random_string = randomString(100000)
  var compressed = snappy.compressSync(arrayBufferToBuffer(stringToArrayBuffer(random_string)))
  t.equal(snappy.isValidCompressedSync(compressed), true)
  var uncompressed = snappyjs.uncompress(compressed)
  var uncompressed_string = arrayBufferToString(bufferToArrayBuffer(uncompressed))
  t.equal(uncompressed_string, random_string)
  t.end()
})
