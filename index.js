(function exporter(root, factory) {

  'use strict';

  /* eslint-disable */

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  }
  else {
    root.ElPointero = factory();
  }

  /* eslint-enable */

}(this, function factory() {

  'use strict';

  /**
   * ElPointero constructor
   * @param {HTMLElement} container  The parent container for all nodes to parse
   * @param {Array} [allowElements=undefined]  An array of HTML element tags to include when searching. No elements except for the direct parent of text nodes are included in the search by default
   * @param {Boolean} [allowText=true]  By default, text nodes are included in the search
   * @param {Integer} [resolution=1]  How accurately should element positions be recorded. Helps to increase this value if the page is really long and maximum memory efficiency is required
   * @returns {ElPointero} ElPointero  the newly created ElPointero object
   */
  function ElPointero(container, allowElements, allowText, resolution) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('A container element must be provided');
    }
    this.container = container;
    this.allowElements = Array.isArray(allowElements) && allowElements.length > 0
      ? allowElements
      : undefined;
    this.allowText = allowText
      ? !!allowText
      : true;
    this.resolution = isNaN(resolution)
      ? 1
      : Math.max(Math.round(resolution), 1);
    this.updateArrays();
    return this;
  }

  ElPointero.prototype.updateArrays = function updateArrays() {
    var containerState = this.getContainerState();
    this.arrays = {};
    if (this.allowText) {
      this.arrays = this.newArrays(
        containerState,
        this.createTextWalker(this.container),
        this.arrays
      );
    }
    if (this.allowElements) {
      this.arrays = this.newArrays(
        containerState,
        this.createElementWalker(this.container, this.allowElements),
        this.arrays
      );
    }
    this.arrays.pos.forEach(function sortInPlaceIfArray(arr) {
      if (Array.isArray(arr)) {
        this.sortArrayOfNodes(arr);
      }
    }, this);
  };

  ElPointero.prototype.getContainerState = function getContainerState() {
    return this.container.getBoundingClientRect();
  };

  ElPointero.prototype.getDocumentState = function getDocumentState() {
    return document.documentElement.getBoundingClientRect();
  };

  ElPointero.prototype.getWindowState = function getWindowState() {
    return {
      height: window.innerHeight || document.documentElement.clientHeight,
      width: window.innerWidth || document.documentElement.clientWidth
    };
  };

  ElPointero.prototype.createTextWalker = function createTextWalker(container) {
    return document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function acceptNode(node) {
        if (!/^\s*$/.test(node.textContent)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }, false);
  };

  ElPointero.prototype.createElementWalker = function createElementWalker(container, a) {
    var allowed = a.map(function elToUpperCase(el) {
      return el.toUpperCase();
    });
    return document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function acceptNode(node) {
        if (allowed.indexOf(node.tagName) !== -1) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }, false);
  };

  ElPointero.prototype.sortArrayOfNodes = function sortArrayOfNodes(arr) {
    if (arr.length > 1) {
      arr.sort(function compareNodes(a, b) {
        var aRect = this.arrays.rect[this.arrays.node.indexOf(a)];
        var bRect = this.arrays.rect[this.arrays.node.indexOf(b)];
        if (aRect.height < bRect.height) {
          return -1;
        }
        if (aRect.height > bRect.height) {
          return 1;
        }
        return 0;
      }.bind(this));
    }
  };

  ElPointero.prototype.newArrays = function newArrays(container, walker, existing) {
    var posArrLen;
    var posArr;
    var nodeArr;
    var rectArr;
    var node;
    var rect;
    var start;
    var end;
    if (existing && Object.keys(existing).length > 0) {
      posArrLen = existing.pos.length;
      posArr = existing.pos;
      nodeArr = existing.node;
      rectArr = existing.rect;
    }
    else {
      posArrLen = Math.floor(container.height / this.resolution);
      posArr = Array(posArrLen);
      nodeArr = [];
      rectArr = [];
    }
    while ((node = walker.nextNode())) {
      node = node.nodeType === 3
        ? node.parentElement
        : node;
      if (nodeArr.indexOf(node) !== -1) {
        // sometimes we catch the parent <p> element when we're actually
        // inside an <em> or <a> element inside the <p> element.
        // there's no way around this, because text nodes don't have
        // clientBoundingRect, so we're just going to make sure we don't
        // bring in duplicates.
        continue;
      }
      rect = node.getBoundingClientRect();
      if (isNaN(rect.height) || rect.height <= 0) {
        continue;
      }
      start = Math.max(Math.round((rect.top - container.top) / this.resolution), 0);
      end = Math.min(Math.round((rect.bottom - container.top) / this.resolution), posArrLen - 1);
      if (start >= end) {
        // we won't make a record of nodes that don't take up any space
        continue;
      }
      for (start; start <= end; start++) {
        if (Array.isArray(posArr[start])) {
          if (posArr[start].indexOf(node) === -1) {
            posArr[start].push(node);
          }
        }
        else {
          posArr[start] = [node];
        }
      }
      rectArr.push(rect);
      nodeArr.push(node);
    }
    return { pos: posArr, node: nodeArr, rect: rectArr };
  };

  ElPointero.prototype.findAt = function sniff(position, max) {
    var posToFind;
    var maxIter;
    var maxPos;
    var minPos;
    var curr;
    var iter;
    posToFind = parseInt(position / this.resolution, 10);
    if (isNaN(posToFind) || posToFind < 0 || posToFind >= this.arrays.pos.length) {
      return undefined;
    }
    maxIter = Math.min((isNaN(max)
      ? 100
      : parseInt(max, 10)), 1000);
    maxPos = this.arrays.pos.length - 1;
    minPos = 0;
    curr = this.arrays.pos[posToFind];
    if (!Array.isArray(curr)) {
      iter = 1;
      while (!Array.isArray(curr) && iter <= maxIter) {
        curr = this.arrays.pos[Math.min(posToFind + iter, maxPos)];
        if (Array.isArray(curr)) {
          break;
        }
        curr = this.arrays.pos[Math.max(posToFind - iter, minPos)];
        if (Array.isArray(curr)) {
          break;
        }
        iter += 1;
      }
    }
    return curr.slice();
  };

  return ElPointero;

}));
