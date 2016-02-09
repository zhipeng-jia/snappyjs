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

var WORD_MASK = [0, 0xff, 0xffff, 0xffffff, 0xffffffff]

function copyBytes (from_array, from_pos, to_array, to_pos, length) {
  var i
  for (i = 0; i < length; i++) {
    to_array[to_pos + i] = from_array[from_pos + i]
  }
}

function selfCopyBytes (array, pos, offset, length) {
  var i
  for (i = 0; i < length; i++) {
    array[pos + i] = array[pos - offset + i]
  }
}

function SnappyDecompressor (compressed) {
  this.array = compressed
  this.pos = 0
}

SnappyDecompressor.prototype.readUncompressedLength = function () {
  var result = 0
  var shift = 0
  var c, val
  while (shift < 32 && this.pos < this.array.length) {
    c = this.array[this.pos]
    this.pos += 1
    val = c & 0x7f
    if (((val << shift) >>> shift) !== val) {
      return -1
    }
    result |= val << shift
    if (c < 128) {
      return result
    }
    shift += 7
  }
  return -1
}

SnappyDecompressor.prototype.uncompressToBuffer = function (out_buffer) {
  var array = this.array
  var array_length = array.length
  var pos = this.pos
  var out_pos = 0

  var c, len, small_len
  var offset

  while (pos < array.length) {
    c = array[pos]
    pos += 1
    if ((c & 0x3) === 0) {
      // Literal
      len = (c >>> 2) + 1
      if (len > 60) {
        if (pos + 3 >= array_length) {
          return false
        }
        small_len = len - 60
        len = array[pos] + (array[pos + 1] << 8) + (array[pos + 2] << 16) + (array[pos + 3] << 24)
        len = (len & WORD_MASK[small_len]) + 1
        pos += small_len
      }
      if (pos + len > array_length) {
        return false
      }
      copyBytes(array, pos, out_buffer, out_pos, len)
      pos += len
      out_pos += len
    } else {
      switch (c & 0x3) {
        case 1:
          len = ((c >>> 2) & 0x7) + 4
          offset = array[pos] + ((c >>> 5) << 8)
          pos += 1
          break
        case 2:
          if (pos + 1 >= array_length) {
            return false
          }
          len = (c >>> 2) + 1
          offset = array[pos] + (array[pos + 1] << 8)
          pos += 2
          break
        case 3:
          if (pos + 3 >= array_length) {
            return false
          }
          len = (c >>> 2) + 1
          offset = array[pos] + (array[pos + 1] << 8) + (array[pos + 2] << 16) + (array[pos + 3] << 24)
          pos += 4
          break
        default:
          break
      }
      if (offset === 0 || offset > out_pos) {
        return false
      }
      selfCopyBytes(out_buffer, out_pos, offset, len)
      out_pos += len
    }
  }
  return true
}

exports.SnappyDecompressor = SnappyDecompressor
