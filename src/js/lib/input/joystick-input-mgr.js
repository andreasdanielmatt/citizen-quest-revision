const EventEmitter = require('events');

/**
 * Handles joystick input
 */
/**
 * @event JoystickInputMgr.events#up
 *
 * @event JoystickInputMgr.events#down
 *
 * @event JoystickInputMgr.events#left
 *
 * @event JoystickInputMgr.events#right
 *
 * @event JoystickInputMgr.events#action
 *
 * @event JoystickInputMgr.events#lang
 */
class JoystickInputMgr {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
  }

  getDirection() {
    return {
      x: 0,
      y: 0,
      action: false,
      lang: false,
    };
  }

  /**
   * Read the joystick input and emit events
   */
  update() {

  }
}

module.exports = JoystickInputMgr;
