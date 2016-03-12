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
