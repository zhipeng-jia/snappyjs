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

const BLOCK_LOG = 16
const BLOCK_SIZE = 1 << BLOCK_LOG

const HASH_TABLE_BITS = 14
const HASH_TABLE_SIZE = 1 << HASH_TABLE_BITS

const HASH_FUNC_SHIFT = 32 - HASH_TABLE_BITS

function hashFunc (key) {
  var h = key * 0x1e35a7bd
  return h >>> HASH_FUNC_SHIFT
}

function load32 (array, pos) {
  return array[pos] + (array[pos + 1] << 8) + (array[pos + 2] << 16) + (array[pos + 3] << 24)
}

function equals32 (array, pos1, pos2) {
  return array[pos1] === array[pos2] &&
         array[pos1 + 1] === array[pos2 + 1] &&
         array[pos1 + 2] === array[pos2 + 2] &&
         array[pos1 + 3] === array[pos2 + 3]
}

function copyBytes (from_array, from_pos, to_array, to_pos, length) {
  var i
  for (i = 0; i < length; i++) {
    to_array[to_pos + i] = from_array[from_pos + i]
  }
}

function emitLiteral (input, ip, len, output, op) {
  if (len <= 60) {
    output[op] = (len - 1) << 2
    op += 1
  } else if (len < 256) {
    output[op] = 60 << 2
    output[op + 1] = len - 1
    op += 2
  } else {
    output[op] = 61 << 2
    output[op + 1] = (len - 1) & 0xff
    output[op + 2] = (len - 1) >> 8
    op += 3
  }
  copyBytes(input, ip, output, op, len)
  return op + len
}

function emitCopyLessThan64 (output, op, offset, len) {
  if (len < 12 && offset < 2048) {
    output[op] = 1 + ((len - 4) << 2) + ((offset >> 8) << 5)
    output[op + 1] = offset & 0xff
    return op + 2
  } else {
    output[op] = 2 + ((len - 1) << 2)
    output[op + 1] = offset & 0xff
    output[op + 2] = offset >> 8
    return op + 3
  }
}

function emitCopy (output, op, offset, len) {
  while (len >= 68) {
    op = emitCopyLessThan64(output, op, offset, 64)
    len -= 64
  }
  if (len > 64) {
    op = emitCopyLessThan64(output, op, offset, 60)
    len -= 60
  }
  return emitCopyLessThan64(output, op, offset, len)
}

function compressFragment (input, ip, input_size, output, op, hash_table) {
  hash_table.fill(0)

  var ip_end = ip + input_size
  var ip_limit
  var base_ip = ip
  var next_emit = ip

  var hash, next_hash
  var next_ip, candidate, skip
  var bytes_between_hash_lookups
  var base, matched, offset
  var prev_hash, cur_hash
  var flag = true

  const INPUT_MARGIN = 15
  if (input_size >= INPUT_MARGIN) {
    ip_limit = ip_end - INPUT_MARGIN

    ip += 1
    next_hash = hashFunc(load32(input, ip))

    while (flag) {
      skip = 32
      next_ip = ip
      do {
        ip = next_ip
        hash = next_hash
        bytes_between_hash_lookups = skip >>> 5
        skip += 1
        next_ip = ip + bytes_between_hash_lookups
        if (ip > ip_limit) {
          flag = false
          break
        }
        next_hash = hashFunc(load32(input, next_ip))
        candidate = base_ip + hash_table[hash]
        hash_table[hash] = ip - base_ip
      } while (!equals32(input, ip, candidate))

      if (!flag) {
        break
      }

      op = emitLiteral(input, next_emit, ip - next_emit, output, op)

      do {
        base = ip
        matched = 4
        while (ip + matched < ip_end && input[ip + matched] === input[candidate + matched]) {
          matched += 1
        }
        ip += matched
        offset = base - candidate
        op = emitCopy(output, op, offset, matched)

        next_emit = ip
        if (ip >= ip_limit) {
          flag = false
          break
        }
        prev_hash = hashFunc(load32(input, ip - 1))
        hash_table[prev_hash] = ip - 1 - base_ip
        cur_hash = hashFunc(load32(input, ip))
        candidate = base_ip + hash_table[cur_hash]
        hash_table[cur_hash] = ip - base_ip
      } while (equals32(input, ip, candidate))

      if (!flag) {
        break
      }

      ip += 1
      next_hash = hashFunc(load32(input, ip))
    }
  }

  if (next_emit < ip_end) {
    op = emitLiteral(input, next_emit, ip_end - next_emit, output, op)
  }

  return op
}

function putVarint (value, output, op) {
  do {
    output[op] = value & 0x7f
    value = value >> 7
    if (value > 0) {
      output[op] += 0x80
    }
    op += 1
  } while (value > 0)
  return op
}

function SnappyCompressor (uncompressed) {
  this.array = new Uint8Array(uncompressed)
  this.hash_table = new Uint16Array(HASH_TABLE_SIZE)
}

SnappyCompressor.prototype.maxCompressedLength = function () {
  var source_len = this.array.length
  return 32 + source_len + Math.floor(source_len / 6)
}

SnappyCompressor.prototype.compressToBuffer = function (out_buffer) {
  var array = this.array
  var length = array.length
  var pos = 0

  var out_array = new Uint8Array(out_buffer)
  var out_pos = 0

  var hash_table = this.hash_table
  var fragment_size

  out_pos = putVarint(length, out_array, out_pos)
  while (pos < length) {
    fragment_size = Math.min(length - pos, BLOCK_SIZE)
    out_pos = compressFragment(array, pos, fragment_size, out_array, out_pos, hash_table)
    pos += fragment_size
  }

  return out_pos
}

exports.SnappyCompressor = SnappyCompressor
