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

function stringToArrayBuffer (source) {
  var array_buffer = new ArrayBuffer(source.length * 2)
  var view = new Uint16Array(array_buffer)
  var i
  for (i = 0; i < source.length; i++) {
    view[i] = source.charCodeAt(i)
  }
  return array_buffer
}

var file_input = document.getElementById('input')
var output = document.getElementById('output')

file_input.addEventListener('change', function (e) {
  output.innerHTML = ''
  var file = file_input.files[0]
  var reader = new FileReader()
  reader.onload = function (e) {
    var text = reader.result
    var text_buffer = stringToArrayBuffer(text)
    output.innerHTML += 'Original byte size: ' + text_buffer.byteLength + '<br>'
    var compressed = SnappyJS.compress(text_buffer)
    output.innerHTML += 'Compressed byte size: ' + compressed.byteLength + '<br>'

    var suite = new Benchmark.Suite()
    suite.add('SnappyJS#compress', function () {
      SnappyJS.compress(text_buffer)
    }).add('SnappyJS#uncompress', function () {
      SnappyJS.uncompress(compressed)
    }).on('cycle', function (event) {
      output.innerHTML += String(event.target) + '<br>'
    }).run()
  }
  reader.readAsText(file)
})
