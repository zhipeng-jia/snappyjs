# SnappyJS [![Travis CI status](https://travis-ci.org/zhipeng-jia/snappyjs.svg?branch=master)](https://travis-ci.org/zhipeng-jia/snappyjs)
A pure JavaScript implementation of Google's [Snappy](https://github.com/google/snappy) compression library.

This implementation is reasonably fast (see benchmark below). It takes advantage of `ArrayBuffer`.

## Install

If using with Node.js,
~~~
npm install snappyjs
~~~

If using with Bower,
~~~
bower install snappyjs
~~~

## Usage

SnappyJS works with Node.js 0.10 or later.
~~~javascript
var SnappyJS = require('snappyjs')
var buffer = new ArrayBuffer(100)
// fill data in buffer
var compressed = SnappyJS.compress(buffer)
var uncompressed = SnappyJS.uncompress(compressed)
~~~

You can also use SnappyJS in browser. Adding `dist/snappyjs.js` or `dist/snappyjs.min.js` will introduce `SnappyJS` in the global scope.
SnappyJS relies on `ArrayBuffer`. All major browsers support it now ([http://caniuse.com/#feat=typedarrays](http://caniuse.com/#feat=typedarrays)). Also, as I tested, SnappyJS has high performance on latest version of Google Chrome, Safari, Firefox, and Microsoft Edge.

## API

### SnappyJS.compress(input)

Compress `input`, which must be type of `ArrayBuffer`. Compressed byte stream is returned, with type `ArrayBuffer`.

### SnappyJS.uncompress(compressed)

Uncompress `compressed`, which must be type of `ArrayBuffer`. Uncompressed byte stream is returned, with type `ArrayBuffer`.

## Benchmark

Although JavaScript is dynamic-typing, all major JS engines are highly optimized.
Thus well-crafted JavaScript code can have competitive performance even compared to native C++ code.

I benchmark SnappyJS against `node-snappy` (which is Node.js binding of native implementation).

Command for benchmark is `node benchmark`. Below is the result running on Node.js v5.5.0.

~~~
Real text #1 (length 618425, byte length 1236850):
node-snappy#compress x 170 ops/sec ±0.96% (74 runs sampled)
snappyjs#compress x 54.34 ops/sec ±1.27% (67 runs sampled)
node-snappy#uncompress x 461 ops/sec ±1.60% (73 runs sampled)
snappyjs#uncompress x 164 ops/sec ±1.31% (70 runs sampled)

Real text #2 (length 3844590, byte length 7689180):
node-snappy#compress x 42.77 ops/sec ±1.33% (54 runs sampled)
snappyjs#compress x 17.78 ops/sec ±1.20% (46 runs sampled)
node-snappy#uncompress x 101 ops/sec ±4.43% (61 runs sampled)
snappyjs#uncompress x 40.93 ops/sec ±0.88% (52 runs sampled)

Random string (length 1000000, byte length 2000000):
node-snappy#compress x 125 ops/sec ±1.76% (73 runs sampled)
snappyjs#compress x 29.34 ops/sec ±2.41% (52 runs sampled)
node-snappy#uncompress x 381 ops/sec ±3.33% (66 runs sampled)
snappyjs#uncompress x 163 ops/sec ±1.40% (70 runs sampled)
~~~

From the result, we see that SnappyJS has 35%~40% performance of native implementation on uncompression,
and 25%~35% performance on compression.

## License

MIT License
