/* eslint-disable no-console */
const ServeSocketConnectorState = require('./server-socket-connector-state');
const { CLOSE_TIMEOUT } = require('../server-socket-connector');

class ClosingState extends ServeSocketConnectorState {
  constructor(connector) {
    super(connector);

    this.timeout = null;
  }

  onEnter() {
    // The attempt to close the socket cleanly timed out, so we're going to force it closed.
    this.timeout = setTimeout(() => {
      console.log('Closing timed out, forcing close.');
      this.connector.onClose();
    }, CLOSE_TIMEOUT);
  }

  onExit() {
    clearTimeout(this.timeout);
  }
}

module.exports = ClosingState;
