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

var SnappyDecompressor = require('./snappy_decompressor').SnappyDecompressor
var SnappyCompressor = require('./snappy_compressor').SnappyCompressor

function uncompress (compressed) {
  if (!(compressed instanceof ArrayBuffer)) {
    throw new TypeError('compressed must be type of ArrayBuffer')
  }
  var decompressor = new SnappyDecompressor(compressed)
  var length = decompressor.readUncompressedLength()
  if (length === -1) {
    throw new Error('Invalid Snappy bitstream')
  }
  var uncompressed = new ArrayBuffer(length)
  if (!decompressor.uncompressToBuffer(uncompressed)) {
    throw new Error('Invalid Snappy bitstream')
  }
  return uncompressed
}

function compress (uncompressed) {
  if (!(uncompressed instanceof ArrayBuffer)) {
    throw new TypeError('uncompressed must be type of ArrayBuffer')
  }
  var compressor = new SnappyCompressor(uncompressed)
  var max_length = compressor.maxCompressedLength()
  var compressed = new ArrayBuffer(max_length)
  var length = compressor.compressToBuffer(compressed)
  return compressed.slice(0, length)
}

exports.uncompress = uncompress
exports.compress = compress
