# SnappyJS [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![Travis CI status](https://travis-ci.org/zhipeng-jia/snappyjs.svg?branch=master)](https://travis-ci.org/zhipeng-jia/snappyjs)
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

Compress `input`, which must be type of `ArrayBuffer` or `Buffer`.
Compressed byte stream is returned, with same type of `input`.

### SnappyJS.uncompress(compressed)

Uncompress `compressed`, which must be type of `ArrayBuffer` or `Buffer`.
Uncompressed byte stream is returned, with same type of `compressed`.

## Benchmark

Although JavaScript is dynamic-typing, all major JS engines are highly optimized.
Thus well-crafted JavaScript code can have competitive performance even compared to native C++ code.

I benchmark SnappyJS against `node-snappy` (which is Node.js binding of native implementation).

Command for benchmark is `node benchmark`. Below is the result running on Node.js v5.5.0.

~~~
Real text #1 (length 618425, byte length 618425), repeated 100 times:
node-snappy#compress x 2.21 ops/sec ±1.07% (10 runs sampled)
snappyjs#compress x 0.86 ops/sec ±2.31% (7 runs sampled)
node-snappy#uncompress x 7.02 ops/sec ±3.72% (21 runs sampled)
snappyjs#uncompress x 2.38 ops/sec ±1.72% (10 runs sampled)

Real text #2 (length 3844590, byte length 3844591), repeated 10 times:
node-snappy#compress x 7.53 ops/sec ±2.66% (23 runs sampled)
snappyjs#compress x 3.45 ops/sec ±1.06% (13 runs sampled)
node-snappy#uncompress x 17.30 ops/sec ±3.83% (32 runs sampled)
snappyjs#uncompress x 7.05 ops/sec ±3.24% (21 runs sampled)

Random string (length 1000000, byte length 1500275), repeated 50 times:
node-snappy#compress x 6.37 ops/sec ±5.88% (20 runs sampled)
snappyjs#compress x 1.78 ops/sec ±1.57% (9 runs sampled)
node-snappy#uncompress x 14.16 ops/sec ±6.89% (38 runs sampled)
snappyjs#uncompress x 5.71 ops/sec ±3.88% (18 runs sampled)

Random string (length 100, byte length 152), repeated 100000 times:
node-snappy#compress x 3.91 ops/sec ±3.99% (14 runs sampled)
snappyjs#compress x 2.96 ops/sec ±1.70% (12 runs sampled)
node-snappy#uncompress x 4.24 ops/sec ±4.77% (15 runs sampled)
snappyjs#uncompress x 12.95 ops/sec ±2.03% (36 runs sampled)
~~~

From the result, we see that SnappyJS has 35%~40% performance of native implementation on uncompression,
and 25%~40% performance on compression.
If input size is small, SnappyJS may have better performance than `node-snappy`.
It is because calling native function in JS is much more expensive than calling a JS function.

## License

MIT License
