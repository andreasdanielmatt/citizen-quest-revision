const ServeSocketConnectorState = require('./server-socket-connector-state');
const { RECONNECT_TIME } = require('../server-socket-connector');

class ReconnectDelayState extends ServeSocketConnectorState {
  constructor(connector) {
    super(connector);

    this.timeout = null;
  }

  onEnter() {
    this.connector.events.emit('connectWait');
    console.log(`Reconnecting in ${RECONNECT_TIME / 1000} seconds...`);
    this.timeout = setTimeout(() => {
      this.connector.connect();
    }, RECONNECT_TIME);
  }

  onExit() {
    clearTimeout(this.reconnectTimeout);
  }
}

module.exports = ReconnectDelayState;
