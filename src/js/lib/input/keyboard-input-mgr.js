const EventEmitter = require('events');

class KeyboardInputMgr {
  constructor() {
    this.events = new EventEmitter();
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
    // Ignore repeated keydown events
    if (event.originalEvent.repeat) {
      return;
    }
    // Read the arrow keys and the spacebar
    if (event.code === 'ArrowLeft') {
      this.pressed.left = true;
      this.events.emit('left');
    } else if (event.code === 'ArrowUp') {
      this.pressed.up = true;
      this.events.emit('up');
    } else if (event.code === 'ArrowRight') {
      this.pressed.right = true;
      this.events.emit('right');
    } else if (event.code === 'ArrowDown') {
      this.pressed.down = true;
      this.events.emit('down');
    } else if (event.code === 'Space') {
      this.pressed.space = true;
      this.events.emit('action');
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
