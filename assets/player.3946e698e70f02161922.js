/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/sass/default.scss":
/*!*******************************!*\
  !*** ./src/sass/default.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/js/lib/components/player-app.js":
/*!*********************************************!*\
  !*** ./src/js/lib/components/player-app.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const Stats = __webpack_require__(/*! ../helpers-web/stats.js */ "./src/js/lib/helpers-web/stats.js");
const TownView = __webpack_require__(/*! ../views/town-view */ "./src/js/lib/views/town-view.js");
__webpack_require__(/*! ../helpers-web/fill-with-aspect */ "./src/js/lib/helpers-web/fill-with-aspect.js");
const PCView = __webpack_require__(/*! ../views/pc-view */ "./src/js/lib/views/pc-view.js");
const KeyboardInputMgr = __webpack_require__(/*! ../input/keyboard-input-mgr */ "./src/js/lib/input/keyboard-input-mgr.js");
const PlayerCharacter = __webpack_require__(/*! ../model/player-character */ "./src/js/lib/model/player-character.js");

class PlayerApp {
  constructor(config, playerId) {
    this.config = config;
    this.playerId = playerId;
    this.pc = new PlayerCharacter(this.config, playerId);
    this.otherPcs = Object.fromEntries(Object.entries(this.config.players)
      .filter(([id, player]) => (player.enabled === undefined || player.enabled) && id !== playerId)
      .map(([id]) => [id, new PlayerCharacter(this.config, id)]));

    this.$element = $('<div></div>')
      .addClass('player-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);
  }

  async init() {
    this.pixiApp = new PIXI.Application({
      // todo: get these from config or constants
      width: PlayerApp.APP_WIDTH,
      height: PlayerApp.APP_HEIGHT,
      backgroundColor: 0xffffff,
    });
    this.$pixiWrapper.append(this.pixiApp.view);

    await this.loadTextures();

    this.townView = new TownView(this.config, this.textures);
    this.pixiApp.stage.addChild(this.townView.display);
    this.pcView = new PCView(this.config, this.pc, this.townView);
    this.otherPcViews = Object.fromEntries(
      Object.entries(this.otherPcs)
        .map(([id, pc]) => [id, new PCView(this.config, pc, this.townView)])
    );

    this.townView.mainLayer.addChild(this.pcView.display);
    if (Object.values(this.otherPcViews).length > 0) {
      this.townView.mainLayer.addChild(...Object.values(this.otherPcViews)
        .map(pcView => pcView.display));
    }

    this.stats = new Stats();
    this.$element.append(this.stats.dom);

    this.keyboardInputMgr = new KeyboardInputMgr();
    this.keyboardInputMgr.addListeners();
    this.keyboardInputMgr.addToggle('KeyD', () => { this.stats.togglePanel(); });

    this.pixiApp.ticker.add((time) => {
      this.stats.frameBegin();
      const { x, y } = this.keyboardInputMgr.getDirection();
      this.pc.setSpeed(x * 10, y * 10);
      this.pcView.animate(time);
      Object.entries(this.otherPcViews).forEach(([, pcView]) => {
        pcView.display.position = pcView.pc.position;
        pcView.display.zIndex = pcView.pc.position.y;
      });
      this.townView.mainLayer.sortChildren();

      // Set the town view's pivot so the PC is always centered on the screen,
      // but don't let the pivot go off the edge of the town
      this.townView.display.pivot.set(
        Math.max(0, Math.min(this.pcView.display.x - PlayerApp.APP_WIDTH / 2, this.townView.townSize.width - PlayerApp.APP_WIDTH)),
        Math.max(0, Math.min(this.pcView.display.y - PlayerApp.APP_HEIGHT / 2, this.townView.townSize.height - PlayerApp.APP_HEIGHT)),
      );
      this.stats.frameEnd();
    });

    return this;
  }

  async loadTextures() {
    PIXI.Assets.init({
      basePath: './static/textures',
      manifest: this.config.textures,
    });

    this.textures = await PIXI.Assets.loadBundle('town-view');
  }

  resize() {
    this.$element.fillWithAspect(PlayerApp.APP_WIDTH / PlayerApp.APP_HEIGHT);
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;

module.exports = PlayerApp;


/***/ }),

/***/ "./src/js/lib/helpers-web/fill-with-aspect.js":
/*!****************************************************!*\
  !*** ./src/js/lib/helpers-web/fill-with-aspect.js ***!
  \****************************************************/
/***/ (() => {

/**
 * A jQuery plugin that resizes the given element to fit its parent element while
 * maintaining the specified aspect ratio.
 *
 * @param element {HTMLElement} The element to resize.
 * @param aspectRatio {number} The aspect ratio to keep.
 */
(function ($) {
  $.fn.fillWithAspect = function (aspectRatio) {
    const $parent = this.parent();
    const parentWidth = $parent.width();
    const parentHeight = $parent.height();
    const parentAspect = parentWidth / parentHeight;
    if (parentAspect > aspectRatio) {
      this.width(parentHeight * aspectRatio);
      this.height(parentHeight);
    } else {
      this.width(parentWidth);
      this.height(parentWidth / aspectRatio);
    }

    return this;
  };
}(jQuery));


/***/ }),

/***/ "./src/js/lib/helpers-web/stats.js":
/*!*****************************************!*\
  !*** ./src/js/lib/helpers-web/stats.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Based on https://github.com/mrdoob/stats.js
 * Copyright (c) 2009-2016 stats.js authors
 * Licensed under the The MIT License
 *
 * adapted by Eric Londaits for IMAGINARY gGmbH (c) 2023
 */

const PR = Math.round(window.devicePixelRatio || 1);
const WIDTH = 80 * PR;
const HEIGHT = 48 * PR;
const TEXT_X = 3 * PR;
const TEXT_Y = 2 * PR;
const GRAPH_X = 3 * PR;
const GRAPH_Y = 15 * PR;
const GRAPH_WIDTH = 74 * PR;
const GRAPH_HEIGHT = 30 * PR;

class Panel {
  constructor(name, fg, bg) {
    this.name = name;
    this.fg = fg;
    this.bg = bg;

    this.min = Infinity;
    this.max = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.style.cssText = 'width:80px;height:48px';

    this.context = this.canvas.getContext('2d');
    this.context.font = `bold ${9 * PR}px Helvetica,Arial,sans-serif`;
    this.context.textBaseline = 'top';
    this.context.fillStyle = this.bg;
    this.context.fillRect(0, 0, WIDTH, HEIGHT);
    this.context.fillStyle = this.fg;
    this.context.fillText(this.name, TEXT_X, TEXT_Y);
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    this.dom = this.canvas;
  }

  update(value, maxValue) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, WIDTH, GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(`${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(this.max)})`,
      TEXT_X,
      TEXT_Y);

    this.context.drawImage(this.canvas,
      GRAPH_X + PR,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT,
      GRAPH_X,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT);

    this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR,
      GRAPH_Y,
      PR,
      Math.round((1 - (value / maxValue)) * GRAPH_HEIGHT));
  }
}

class Stats {
  constructor() {
    this.currentPanel = null;
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
    this.container.addEventListener('click', (event) => {
      event.preventDefault();
      this.togglePanel(false);
    });
    this.dom = this.container;

    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;

    this.lastPingTime = (performance || Date).now();
    this.maxPing = 0;
    this.pingElapsedTime = 0;

    this.panels = new Map();

    this.fpsPanel = this.addPanel('fps', new Panel('fps', '#0ff', '#002'));
    this.msPanel = this.addPanel('render', new Panel('ms', '#0f0', '#020'));
    this.pingPanel = this.addPanel('ping', new Panel('ping', '#fffb13', '#020'));

    this.showPanel(0);
  }

  addPanel(id, panel) {
    this.panels.set(id, panel);
    this.container.appendChild(panel.dom);
    return panel;
  }

  showPanel(id = null) {
    this.currentPanel = null;
    Array.from(this.panels.entries())
      .forEach(([panelId, panel], index) => {
        if (panelId === id) {
          panel.dom.style.display = 'block';
          this.currentPanel = index;
        } else {
          panel.dom.style.display = 'none';
        }
      });
  }

  showPanelNumber(index = null) {
    const panelId = Array.from(this.panels.keys())
      .find((id, i) => i === index);
    this.showPanel(panelId === undefined ? null : panelId);
  }

  togglePanel(hideAfterLast = true) {
    if (this.currentPanel === null) {
      this.currentPanel = 0;
    } else {
      this.currentPanel += 1;
      if (this.currentPanel === this.container.children.length) {
        this.currentPanel = hideAfterLast ? null : 0;
      }
    }
    this.showPanelNumber(this.currentPanel);
  }

  frameBegin() {
    this.beginTime = (performance || Date).now();
  }

  frameEnd() {
    this.frames += 1;
    const time = (performance || Date).now();
    this.msPanel.update(time - this.beginTime, 200);

    if (time >= this.prevTime + 1000) {
      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);
      this.prevTime = time;
      this.frames = 0;
    }
    return time;
  }

  ping() {
    const time = (performance || Date).now();
    const ping = time - this.lastPingTime;
    this.lastPingTime = time;
    this.maxPing = Math.max(this.maxPing, ping);
    this.pingElapsedTime += ping;
    if (this.pingElapsedTime >= 1000) {
      this.pingPanel.update(this.maxPing, 1000);
      this.pingElapsedTime = 0;
      this.maxPing = 0;
    }
  }

  update() {
    this.beginTime = this.frameEnd();
  }
}

Stats.Panel = Panel;

module.exports = Stats;


/***/ }),

/***/ "./src/js/lib/helpers/clone.js":
/*!*************************************!*\
  !*** ./src/js/lib/helpers/clone.js ***!
  \*************************************/
/***/ ((module) => {

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

module.exports = clone;


/***/ }),

/***/ "./src/js/lib/input/keyboard-input-mgr.js":
/*!************************************************!*\
  !*** ./src/js/lib/input/keyboard-input-mgr.js ***!
  \************************************************/
/***/ ((module) => {

class KeyboardInputMgr {
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.pressed = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.toggles = {};
  }

  addListeners() {
    $(document).on('keydown', this.handleKeyDown);
    $(document).on('keyup', this.handleKeyUp);
  }

  removeListeners() {
    $(document).off('keydown', this.handleKeyDown);
    $(document).off('keyup', this.handleKeyUp);
  }

  handleKeyDown(event) {
    // Read the arrow keys and the spacebar
    if (event.code === 'ArrowLeft') {
      this.pressed.left = true;
    } else if (event.code === 'ArrowUp') {
      this.pressed.up = true;
    } else if (event.code === 'ArrowRight') {
      this.pressed.right = true;
    } else if (event.code === 'ArrowDown') {
      this.pressed.down = true;
    } else if (event.code === 'Space') {
      this.pressed.space = true;
    } else if (this.toggles[event.code]) {
      this.toggles[event.code]();
    }
  }

  handleKeyUp(event) {
    // Read the arrow keys
    if (event.code === 'ArrowLeft') {
      this.pressed.left = false;
    } else if (event.code === 'ArrowUp') {
      this.pressed.up = false;
    } else if (event.code === 'ArrowRight') {
      this.pressed.right = false;
    } else if (event.code === 'ArrowDown') {
      this.pressed.down = false;
    } else if (event.code === 'Space') {
      this.pressed.space = false;
    }
  }

  getDirection() {
    return {
      x: (this.pressed.right ? 1 : 0) - (this.pressed.left ? 1 : 0),
      y: (this.pressed.down ? 1 : 0) - (this.pressed.up ? 1 : 0),
      action: this.pressed.space,
    };
  }

  addToggle(code, callback) {
    this.toggles[code] = callback;
  }
}

module.exports = KeyboardInputMgr;


/***/ }),

/***/ "./src/js/lib/loader/show-fatal-error.js":
/*!***********************************************!*\
  !*** ./src/js/lib/loader/show-fatal-error.js ***!
  \***********************************************/
/***/ ((module) => {

function showFatalError(text, error) {
  $('<div></div>')
    .addClass('fatal-error')
    .append($('<div></div>')
      .addClass('fatal-error-text')
      .html(text))
    .append($('<div></div>')
      .addClass('fatal-error-details')
      .html(error.message))
    .appendTo('body');

  $('html').addClass('with-fatal-error');
}

module.exports = showFatalError;


/***/ }),

/***/ "./src/js/lib/model/player-character.js":
/*!**********************************************!*\
  !*** ./src/js/lib/model/player-character.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const clone = __webpack_require__(/*! ../helpers/clone */ "./src/js/lib/helpers/clone.js");

class PlayerCharacter {
  constructor(config, id) {
    this.config = config;
    this.id = id;
    if (this.config.players[this.id] === undefined) {
      throw new Error(`Attempted to initialize a player with id ${this.id}, which was not found in the config`);
    }
    this.props = clone(this.config.players[this.id]);

    this.position = { x: 0, y: 0 };
    this.speed = { x: 0, y: 0 };
    this.setPosition(this.props.spawn.x, this.props.spawn.y);
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  setSpeed(x, y) {
    this.speed.x = x;
    this.speed.y = y;
  }
}

module.exports = PlayerCharacter;


/***/ }),

/***/ "./src/js/lib/net/connection-state-view.js":
/*!*************************************************!*\
  !*** ./src/js/lib/net/connection-state-view.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const icon = __webpack_require__(/*! ../../../../static/fa/broadcast-tower-solid.svg */ "./static/fa/broadcast-tower-solid.svg");

class ConnectionStateView {
  constructor(connector) {
    this.$element = $('<div></div>')
      .addClass('connection-state-view');

    this.$icon = $('<img>')
      .attr('src', icon)
      .addClass('connection-state-view-icon')
      .appendTo(this.$element);

    this.$errorMessage = $('<div></div>')
      .addClass('connection-state-view-error text-danger')
      .appendTo(this.$element);
    this.$errorStatus = $('<div></div>')
      .addClass('connection-state-view-status')
      .appendTo(this.$element);

    connector.events.on('closing', this.handleClosing.bind(this));
    connector.events.on('disconnect', this.handleDisconnect.bind(this));
    connector.events.on('connectWait', this.handleConnectWait.bind(this));
    connector.events.on('connecting', this.handleConnecting.bind(this));
    connector.events.on('connect', this.handleConnect.bind(this));
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }

  setErrorMessage(message) {
    this.$errorMessage.html(message);
  }

  setErrorStatus(status) {
    this.$errorStatus.html(status);
  }

  handleClosing() {
    this.setErrorMessage('Retrying connection');
    this.setErrorStatus('');
    this.show();
  }

  handleDisconnect() {
    this.setErrorMessage('Disconnected from server');
    this.setErrorStatus('');
    this.show();
  }

  handleConnectWait() {
    this.setErrorStatus('Waiting to reconnect...');
  }

  handleConnecting() {
    this.setErrorStatus('Connecting...');
  }

  handleConnect() {
    this.hide();
  }
}

module.exports = ConnectionStateView;


/***/ }),

/***/ "./src/js/lib/net/server-socket-connector.js":
/*!***************************************************!*\
  !*** ./src/js/lib/net/server-socket-connector.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-console */
const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

const PING_TIME = 1000 * 10;
const PONG_WAIT_TIME = 1000 * 10;
const RECONNECT_TIME = 1000 * 5;

class ServerSocketConnector {
  constructor(uri) {
    this.uri = uri;
    this.ws = null;
    this.connected = false;
    // Must track isClosing because the socket might enter CLOSING state and not close immediately
    this.isClosing = false;
    this.events = new EventEmitter();
    this.pingTimeout = null;
    this.pongTimeout = null;
    this.reconnectTimeout = null;
    this.connect();
  }

  connect() {
    this.cancelPing();
    this.cancelReconnect();

    this.events.emit('connecting');
    console.log(`Connecting to ${this.uri}...`);
    this.ws = new WebSocket(this.uri);
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    // ws.onerror is not handled because the event gives no data about the
    // error, and on a connection failure onclose will be called.

    this.connected = false;
  }

  cancelReconnect() {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  reconnect() {
    this.cancelReconnect();
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_TIME);
    this.events.emit('connectWait');
    console.log(`Will attempt to reconnect in ${RECONNECT_TIME / 1000} seconds...`);
  }

  handleOpen() {
    this.cancelReconnect();
    this.cancelPongTimeout();

    this.connected = true;
    this.isClosing = false;
    console.log('Connected.');
    this.events.emit('connect');
    this.schedulePing();
  }

  handleClose(ev) {
    this.connected = false;
    this.isClosing = false;
    this.cancelPing();
    this.cancelPongTimeout();
    // ev.code is defined here https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    // but according to people the only code one normally gets is 1006 (Abnormal Closure)
    console.error(
      `Disconnected with code ${ev.code}`,
      ev.code === 1006 ? ': Abnormal closure' : '',
      ev.reason ? `(reason: ${ev.reason})` : ''
    );
    this.events.emit('disconnect');
    this.reconnect();
  }

  handleMessage(ev) {
    const message = JSON.parse(ev.data);
    if (message.type === 'sync') {
      this.handleSync(message);
    } else if (message.type === 'pong') {
      this.handlePong();
    }
  }

  handleSync(message) {
    this.events.emit('sync', message);
  }

  handlePong() {
    this.cancelPongTimeout();
    this.schedulePing();
  }

  send(data) {
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
  }

  cancelPing() {
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  schedulePing() {
    this.cancelPing();
    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null;
      this.ping();
    }, PING_TIME);
  }

  cancelPongTimeout() {
    if (this.pongTimeout !== null) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  startPongTimeout() {
    this.cancelPongTimeout();
    this.pongTimeout = setTimeout(() => {
      this.pongTimeout = null;
      console.warn(`PONG not received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Closing connection');
      if (!this.isClosing) {
        this.isClosing = true;
        this.events.emit('closing');
      }
      this.ws.close();
    }, PONG_WAIT_TIME);
  }

  ping() {
    this.send('ping');
    this.startPongTimeout();
  }

  sync(player = null) {
    const message = {
      type: 'sync',
    };
    if (player !== null) {
      message.players = Object.fromEntries([[player.id,
        {
          position: player.position,
          speed: player.speed,
        },
      ]]);
    }
    this.send(message);
  }
}

module.exports = ServerSocketConnector;


/***/ }),

/***/ "./src/js/lib/net/server-url.js":
/*!**************************************!*\
  !*** ./src/js/lib/net/server-url.js ***!
  \**************************************/
/***/ ((module) => {

function withLeadingSlash(str) {
  return str[0] === '/' ? str : `/${str}`;
}

function withTrailingSlash(str) {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}

function withTrailingColon(str) {
  return str[str.length - 1] === ':' ? str : `${str}:`;
}

function getApiServerUrl() {
  const protocol = withTrailingColon("MISSING_ENV_VAR".API_SERVER_PROTOCOL || window.location.protocol);
  const host = "MISSING_ENV_VAR".API_SERVER_HOST || window.location.hostname;
  const port = "4850" || 0;
  const root = withTrailingSlash(withLeadingSlash("MISSING_ENV_VAR".API_SERVER_ROOT || '/'));

  return `${protocol}//${host}:${port}${root}`;
}

function getSocketServerUrl() {
  const protocol = withTrailingColon("MISSING_ENV_VAR".SOCKET_SERVER_PROTOCOL || 'ws');
  const host = "MISSING_ENV_VAR".SOCKET_SERVER_HOST || window.location.hostname;
  const port = "4850" || 0;
  const root = withTrailingSlash(withLeadingSlash("MISSING_ENV_VAR".SOCKET_SERVER_ROOT || '/'));

  return `${protocol}//${host}:${port}${root}`;
}

module.exports = {
  getApiServerUrl,
  getSocketServerUrl,
};


/***/ }),

/***/ "./src/js/lib/views/pc-view.js":
/*!*************************************!*\
  !*** ./src/js/lib/views/pc-view.js ***!
  \*************************************/
/***/ ((module) => {

/* globals PIXI */

class PCView {
  constructor(config, pc, townView) {
    this.config = config;
    this.pc = pc;
    this.townView = townView;
    this.display = new PIXI.Graphics();
    this.display.beginFill(new PIXI.Color(this.pc.props.color || '#61dcbd'));
    this.display.drawRect(0, 0, 64, 128);
    this.display.endFill();
    this.display.position = this.pc.position;
  }

  animate(time) {
    const townDisplay = this.townView.display;
    let newX;
    let newY;
    let furthestX = this.pc.position.x + this.pc.speed.x * time;
    let furthestY = this.pc.position.y + this.pc.speed.y * time;

    // Clamp the position to the town's bounds
    furthestX = Math.max(0, Math.min(furthestX, townDisplay.width - this.display.width));
    furthestY = Math.max(0, Math.min(furthestY, townDisplay.height - this.display.height));

    // Collisions are checked on a per-pixel basis, so we only need to check
    // if the player has moved to a new pixel
    if (Math.floor(furthestX) !== Math.floor(this.pc.position.x)
      || Math.floor(furthestY) !== Math.floor(this.pc.position.y)) {
      // Check for collisions
      const collisionPoints = this.collisionPoints();
      newX = this.pc.position.x;
      newY = this.pc.position.y;
      const deltaX = furthestX - this.pc.position.x;
      const deltaY = furthestY - this.pc.position.y;
      const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const stepX = deltaX / steps;
      const stepY = deltaY / steps;
      let collidedX = false;
      let collidedY = false;
      for (let i = 0; !(collidedX && collidedY) && i < steps; i += 1) {
        const candidateX = newX + stepX;
        const candidateY = newY + stepY;
        for (let j = 0; !(collidedX && collidedY) && j < collisionPoints.length; j += 1) {
          if (!this.townView.isWalkable(
            Math.floor(newX + collisionPoints[j].x),
            Math.floor(candidateY + collisionPoints[j].y)
          )) {
            collidedY = true;
          }
          if (!this.townView.isWalkable(
            Math.floor(candidateX + collisionPoints[j].x),
            Math.floor(newY + collisionPoints[j].y)
          )) {
            collidedX = true;
          }
          if (!collidedX && !collidedY && !this.townView.isWalkable(
            Math.floor(candidateX + collisionPoints[j].x),
            Math.floor(candidateY + collisionPoints[j].y)
          )) {
            collidedX = true;
            collidedY = true;
          }
        }
        newX = collidedX ? newX : candidateX;
        newY = collidedY ? newY : candidateY;
      }
    } else {
      newX = furthestX;
      newY = furthestY;
    }

    this.pc.setPosition(newX, newY);
    this.display.position = this.pc.position;
    this.display.zIndex = this.pc.position.y;
  }

  collisionPoints() {
    // The collisions are only checked for two points at the baseline of the PC,
    return [
      {
        x: 0,
        y: this.display.height,
      },
      {
        x: this.display.width,
        y: this.display.height,
      },
    ];
  }
}

module.exports = PCView;


/***/ }),

/***/ "./src/js/lib/views/town-view.js":
/*!***************************************!*\
  !*** ./src/js/lib/views/town-view.js ***!
  \***************************************/
/***/ ((module) => {

/* globals PIXI */
class TownView {
  constructor(config, textures) {
    this.config = config;
    this.textures = textures;
    this.display = new PIXI.Container();
    this.bgLayer = new PIXI.Container();
    this.mainLayer = new PIXI.Container();
    this.display.addChild(this.bgLayer);
    this.display.addChild(this.mainLayer);

    // Temporary initialization
    this.townSize = {
      width: 1024 * 8,
      height: 768 * 6,
    };

    this.background = PIXI.Sprite.from(this.textures['town-bg']);
    this.background.width = this.townSize.width;
    this.background.height = this.townSize.height;
    this.bgLayer.addChild(this.background);

    this.collisionRenderer = new PIXI.CanvasRenderer({
      width: this.townSize.width, height: this.townSize.height,
    });
    this.collisionTree = new PIXI.Container();
    this.baseCollisionMap = PIXI.Sprite.from(this.textures['town-collmap']);
    this.baseCollisionMap.width = this.townSize.width;
    this.baseCollisionMap.height = this.townSize.height;
    this.collisionTree.addChild(this.baseCollisionMap);
    this.collisionTree.renderCanvas(this.collisionRenderer);
    this.collisionMap = this.collisionRenderer.view
      .getContext('2d')
      .getImageData(0, 0, this.townSize.width, this.townSize.height).data;

    window.isWalkable = this.isWalkable.bind(this);
    window.collMap = this.collisionMap;
  }

  async loadAssets() {
    this.assets = await PIXI.Assets.load();
  }

  isWalkable(x, y) {
    // todo: make a map that's 1byte per pixel instead of 4
    return this.collisionMap[y * this.townSize.width * 4 + x * 4] == 0;
  }
}

module.exports = TownView;


/***/ }),

/***/ "./static/fa/broadcast-tower-solid.svg":
/*!*********************************************!*\
  !*** ./static/fa/broadcast-tower-solid.svg ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "ead51173b07512a4bf13.svg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/js/player.js ***!
  \**************************/
const ServerSocketConnector = __webpack_require__(/*! ./lib/net/server-socket-connector */ "./src/js/lib/net/server-socket-connector.js");
const ConnectionStateView = __webpack_require__(/*! ./lib/net/connection-state-view */ "./src/js/lib/net/connection-state-view.js");
const showFatalError = __webpack_require__(/*! ./lib/loader/show-fatal-error */ "./src/js/lib/loader/show-fatal-error.js");
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
const PlayerApp = __webpack_require__(/*! ./lib/components/player-app */ "./src/js/lib/components/player-app.js");
const { getApiServerUrl, getSocketServerUrl } = __webpack_require__(/*! ./lib/net/server-url */ "./src/js/lib/net/server-url.js");

const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get('p') || '1';
const statsPanel = urlParams.get('s') || null;
const configUrl = `${getApiServerUrl()}config`;

fetch(configUrl, { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${ response.status }`);
    }
    return response.json();
  })
  .catch((err) => {
    console.log(err);
    showFatalError(`Error fetching configuration from ${configUrl}`, err);
    console.error(`Error fetching configuration from ${configUrl}`);
    throw err;
  })
  .then((config) => {
    const playerApp = new PlayerApp(config, playerId);
    return playerApp.init();
  })
  .then((playerApp) => {
    $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
    playerApp.resize();
    $(window).on('resize', () => {
      playerApp.resize();
    });

    let syncReceived = false;
    const connector = new ServerSocketConnector(getSocketServerUrl());
    connector.events.on('connect', () => {
      syncReceived = true;
    });
    connector.events.on('sync', (message) => {
      syncReceived = true;
      playerApp.stats.ping();
      Object.entries(message.players).forEach(([id, player]) => {
        if (id !== playerId && playerApp.otherPcs[id]) {
          if (player.position) {
            playerApp.otherPcs[id].setPosition(player.position.x, player.position.y);
          }
          if (player.speed) {
            playerApp.otherPcs[id].setSpeed(player.speed.x, player.speed.y);
          }
        }
      });
    });
    playerApp.pixiApp.ticker.add(() => {
      if (syncReceived) {
        connector.sync(playerApp.pc);
        syncReceived = false;
      }
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);

    if (statsPanel) {
      playerApp.stats.showPanel(statsPanel);
    }
  })
  .catch((err) => {
    console.error(err);
  });

})();

/******/ })()
;
//# sourceMappingURL=player.3946e698e70f02161922.js.map