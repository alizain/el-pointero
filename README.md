# Sniffer.js
Find elements in the DOM that are at a specific position on the page.

```javascript
// initialize the library
var sniffer = new Sniffer(document.getElementById('article'));
// find which elements are at the 1000px mark
sniffer.sniff(1000);
// find which elements are at the top of the screen
sniffer.sniff(scrollY);
```

## Installation
### NPM

```shell
npm install --save sniffer.js
```

### Bower

```shell
bower install --save sniffer.js
```
