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

var fileInput = document.getElementById('input')
var output = document.getElementById('output')

fileInput.addEventListener('change', function (e) {
  output.innerHTML = ''
  var file = fileInput.files[0]
  var reader = new FileReader()
  reader.onload = function (e) {
    var contentBuffer = reader.result
    output.innerHTML += 'Original byte size: ' + contentBuffer.byteLength + '<br>'
    var compressed = SnappyJS.compress(contentBuffer)
    output.innerHTML += 'Compressed byte size: ' + compressed.byteLength + '<br>'

    var suite = new Benchmark.Suite()
    suite.add('SnappyJS#compress', function () {
      SnappyJS.compress(contentBuffer)
    }).add('SnappyJS#uncompress', function () {
      SnappyJS.uncompress(compressed)
    }).on('cycle', function (event) {
      output.innerHTML += String(event.target) + '<br>'
    }).run()
  }
  reader.readAsArrayBuffer(file)
})
