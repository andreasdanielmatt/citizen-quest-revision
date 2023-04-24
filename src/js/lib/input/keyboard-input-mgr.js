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
    if (event.keyCode === 37) {
      this.pressed.left = true;
    } else if (event.keyCode === 38) {
      this.pressed.up = true;
    } else if (event.keyCode === 39) {
      this.pressed.right = true;
    } else if (event.keyCode === 40) {
      this.pressed.down = true;
    } else if (event.keyCode === 32) {
      this.pressed.space = true;
    }
  }

  handleKeyUp(event) {
    // Read the arrow keys
    if (event.keyCode === 37) {
      this.pressed.left = false;
    } else if (event.keyCode === 38) {
      this.pressed.up = false;
    } else if (event.keyCode === 39) {
      this.pressed.right = false;
    } else if (event.keyCode === 40) {
      this.pressed.down = false;
    } else if (event.keyCode === 32) {
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
}

module.exports = KeyboardInputMgr;
