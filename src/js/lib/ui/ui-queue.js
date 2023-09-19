/**
 * A queue for executing UI transitions serially.
 *
 * This queue allows for multiple UI transitions to be queued up, and executed one after the other.
 * Each transition is specified as a callback and a minimum duration to wait after executing it.
 */
class UIQueue {
  constructor() {
    this.items = [];
    this.timeout = null;
  }

  /**
   * Add a callback to the queue.
   *
   * The callback will be executed immediately, or if a previously added callback is still
   * executing, it will be executed after the previous callback has finished.
   *
   * @param {function} callback
   *  The callback to add to the queue.
   * @param {number|function} [duration=0]
   *  The duration to wait after executing the callback. If a function is provided, it will be
   *  called (right before executing the callback) to determine the duration.
   */
  add(callback, duration = 0) {
    this.items.push({
      callback,
      duration,
    });

    if (this.timeout === null) {
      this.next();
    }
  }

  /**
   * Stop and empty the queue.
   */
  cancel() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.items = [];
  }

  /**
   * Execute the next callback in the queue.
   * @private
   */
  next() {
    if (this.items.length === 0) {
      this.timeout = null;
      return;
    }

    const item = this.items.shift();
    const duration = typeof item.duration === 'function' ? item.duration() : item.duration;
    item.callback();
    this.timeout = setTimeout(this.next.bind(this), duration);
  }
}

module.exports = UIQueue;
