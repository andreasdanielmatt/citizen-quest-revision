const EventEmitter = require('events');

class FlagStore {
  constructor() {
    this.flags = {};
    this.events = new EventEmitter();
  }

  exists(flag) {
    return !!this.flags[flag];
  }

  value(flag) {
    return this.flags[flag] || 0;
  }

  touch(flag) {
    if (!this.exists(flag)) {
      this.set(flag, 1);
    }
  }

  set(flag, value) {
    const oldValue = this.flags[flag] || undefined;
    this.flags[flag] = Math.min(FlagStore.MAX_VALUE, Math.max(FlagStore.MIN_VALUE, value));
    this.events.emit('flag', flag, this.flags[flag], oldValue);
  }

  inc(flag, amount = 1) {
    if (this.flags[flag] === undefined) {
      this.flags[flag] = 0;
    }
    this.set(flag, this.flags[flag] + amount);
  }

  dec(flag, amount = 1) {
    if (this.flags[flag] === undefined) {
      this.flags[flag] = 0;
    }
    this.set(flag, this.flags[flag] - amount);
  }

  clear() {
    this.flags = {};
  }
}

FlagStore.MIN_VALUE = 0;
FlagStore.MAX_VALUE = 999;

module.exports = FlagStore;
