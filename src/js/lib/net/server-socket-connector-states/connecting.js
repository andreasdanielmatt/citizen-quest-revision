/* eslint-disable no-console */
const ServeSocketConnectorState = require('./server-socket-connector-state');
const { CONNECT_TIMEOUT } = require('../server-socket-connector');

class ConnectingState extends ServeSocketConnectorState {
  constructor(connector) {
    super(connector);

    this.connectTimeout = null;
  }

  onEnter() {
    this.connectTimeout = setTimeout(() => {
      console.log('Connecting timed out, reconnecting...');
      this.connector.connect();
    }, CONNECT_TIMEOUT);
  }

  onExit() {
    clearTimeout(this.connectTimeout);
  }
}

module.exports = ConnectingState;
