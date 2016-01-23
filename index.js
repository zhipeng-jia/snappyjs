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
