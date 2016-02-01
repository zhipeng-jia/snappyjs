# SnappyJS [![Travis CI status](https://travis-ci.org/zhipeng-jia/snappyjs.svg?branch=master)](https://travis-ci.org/zhipeng-jia/snappyjs)
A pure JavaScript implementation of Google's [Snappy](https://github.com/google/snappy) compression library.

This implementation is reasonably fast. It takes advantage of `ArrayBuffer`.

## Usage

SnappyJS works with NodeJS 4.x or later.
~~~javascript
var SnappyJS = require('snappyjs')
var buffer = new ArrayBuffer(100)
// fill data in buffer
var compressed = SnappyJS.compress(buffer)
var uncompressed = SnappyJS.uncompress(compressed)
~~~

You can also use SnappyJS in browser. Adding `dist/snappyjs.js` or `dist/snappyjs.min.js` will introduce `SnappyJS` in the global scope.

## API

### SnappyJS.compress(input)

Compress `input`, which must be type of `ArrayBuffer`. Compressed byte stream is returned, with type `ArrayBuffer`.

### SnappyJS.uncompress(compressed)

Uncompress `compressed`, which must be type of `ArrayBuffer`. Uncompressed byte stream is returned, with type `ArrayBuffer`.

## License

MIT License
