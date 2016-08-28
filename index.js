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

function isNode () {
  if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
      if (typeof process.versions.node !== 'undefined') {
        return true
      }
    }
  }
  return false
}

var is_node = isNode()

function isUint8Array (object) {
  return object instanceof Uint8Array && (!is_node || !Buffer.isBuffer(object))
}

function isArrayBuffer (object) {
  return object instanceof ArrayBuffer
}

function isBuffer (object) {
  if (!is_node) {
    return false
  }
  return Buffer.isBuffer(object)
}

var SnappyDecompressor = require('./snappy_decompressor').SnappyDecompressor
var SnappyCompressor = require('./snappy_compressor').SnappyCompressor

var TYPE_ERROR_MSG = 'Argument compressed must be type of ArrayBuffer, Buffer, or Uint8Array'

function uncompress (compressed) {
  if (!isUint8Array(compressed) && !isArrayBuffer(compressed) && !isBuffer(compressed)) {
    throw new TypeError(TYPE_ERROR_MSG)
  }
  var uint8_mode = false
  var array_buffer_mode = false
  if (isUint8Array(compressed)) {
    uint8_mode = true
  } else if (isArrayBuffer(compressed)) {
    array_buffer_mode = true
    compressed = new Uint8Array(compressed)
  }
  var decompressor = new SnappyDecompressor(compressed)
  var length = decompressor.readUncompressedLength()
  if (length === -1) {
    throw new Error('Invalid Snappy bitstream')
  }
  var uncompressed, uncompressed_view
  if (uint8_mode) {
    uncompressed = new Uint8Array(length)
    if (!decompressor.uncompressToBuffer(uncompressed)) {
      throw new Error('Invalid Snappy bitstream')
    }
  } else if (array_buffer_mode) {
    uncompressed = new ArrayBuffer(length)
    uncompressed_view = new Uint8Array(uncompressed)
    if (!decompressor.uncompressToBuffer(uncompressed_view)) {
      throw new Error('Invalid Snappy bitstream')
    }
  } else {
    uncompressed = new Buffer(length)
    if (!decompressor.uncompressToBuffer(uncompressed)) {
      throw new Error('Invalid Snappy bitstream')
    }
  }
  return uncompressed
}

function compress (uncompressed) {
  if (!isUint8Array(uncompressed) && !isArrayBuffer(uncompressed) && !isBuffer(uncompressed)) {
    throw new TypeError(TYPE_ERROR_MSG)
  }
  var uint8_mode = false
  var array_buffer_mode = false
  if (isUint8Array(compressed)) {
    uint8_mode = true
  } else if (isArrayBuffer(uncompressed)) {
    array_buffer_mode = true
    uncompressed = new Uint8Array(uncompressed)
  }
  var compressor = new SnappyCompressor(uncompressed)
  var max_length = compressor.maxCompressedLength()
  var compressed, compressed_view
  var length
  if (uint8_mode) {
    compressed = new Uint8Array(max_length)
    length = compressor.compressToBuffer(compressed)
  } else if (array_buffer_mode) {
    compressed = new ArrayBuffer(max_length)
    compressed_view = new Uint8Array(compressed)
    length = compressor.compressToBuffer(compressed_view)
  } else {
    compressed = new Buffer(max_length)
    length = compressor.compressToBuffer(compressed)
  }
  return compressed.slice(0, length)
}

exports.uncompress = uncompress
exports.compress = compress
