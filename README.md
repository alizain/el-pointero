# El Pointero
Find DOM elements using Y-coordinates (points).

```javascript
// initialize the library
var elp = new ElPointero(document.getElementById('article'));

// find which elements are at the 1000px mark
elp.findAt(1000);

// find which elements are at the top of the screen
elp.findAt(scrollY);
```

## Installation
### NPM

```shell
npm install --save el-pointero
```

### Bower

```shell
bower install --save el-pointero
```

## About the Implementation

For maximum developer laziness, efficiency, and speed, the library does most of its work upfront when it initializes. We create one massive sparse array that holds all the positions in the DOM and the element(s) that reside at that position. This looks something like so:

```javascript
[
    ,   [ h2 ]          // 110 pixels
    ,   [ h2 ]          // 111 pixels
    ,   [ h2 ]          // 112 pixels
    ,   [ h2 ]          // 113 pixels
    ,   [ h2 ]          // 114 pixels
    ,   undefined       // 115 pixels
    ,   undefined       // 116 pixels
    ,   undefined       // 117 pixels
    ,   undefined       // 118 pixels
    ,   undefined       // 119 pixels
    ,   [ a, p ]        // 110 pixels
    ,   [ a, p ]        // 121 pixels
    ,   [ a, p ]        // 122 pixels
    ,   [ a, p ]        // 123 pixels
    ,   [ a, p ]        // 124 pixels
    ,   [ a, p ]        // 125 pixels
    ,   [ p ]           // 126 pixels
    ,   [ p ]           // 127 pixels
    ,   [ p ]           // 128 pixels
    ,   [ p ]           // 129 pixels
    ,   [ p ]           // 130 pixels
]
```

There are some optimizations that can be turned on which will use less memory by approximating node positions.

Now, with more learning/research, we've confirmed a hunch: this is a problem for tree structures. We're lucky that we're dealing with pixels on a webpage because they have a definitive end, always start from 0, and don't continue on for very long. That's why the naive approach isn't all that bad. With it, I reason that we effectively get `O(1)` read time complexity, `O(n)` setup time cost, and `O(k/r + 3n)` memory efficiency where `k` is the vertical height of the page in pixels and `r` is the resolution setting. For fun, learning, and profit, however, we're going to try to implement tree based data-structures.

## More efficient data structures

Based on this [SO](http://stackoverflow.com/questions/17466218/what-are-the-differences-between-segment-trees-interval-trees-binary-indexed-t) question, and more research, I think the most ideal structure is an `interval-tree`.
