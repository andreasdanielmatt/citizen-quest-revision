const ServeSocketConnectorState = require('./server-socket-connector-state');

class ReconnectDelayState extends ServeSocketConnectorState {
  constructor(connector) {
    super(connector);

    this.timeout = null;
  }

  onEnter() {
    this.connector.events.emit('connectWait');
    const timeout = this.connector.config.network.reconnectTime || 5000;
    console.log(`Reconnecting in ${timeout / 1000} seconds...`);
    this.timeout = setTimeout(() => {
      // this.connector.connect();
    }, timeout);
  }

  onExit() {
    clearTimeout(this.reconnectTimeout);
  }
}

module.exports = ReconnectDelayState;
