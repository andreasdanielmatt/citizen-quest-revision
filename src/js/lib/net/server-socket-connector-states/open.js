/* eslint-disable no-console */
const ServeSocketConnectorState = require('./server-socket-connector-state');
const { PING_TIME, PONG_WAIT_TIME } = require('../server-socket-connector');

class OpenState extends ServeSocketConnectorState {
  constructor(connector) {
    super(connector);

    this.pingTimeout = null;
    this.pongTimeout = null;
    this.serverInfoTimeout = null;
  }

  onEnter() {
    this.schedulePing();
    this.scheduleServerInfoTimeout();
  }

  onExit() {
    clearTimeout(this.pingTimeout);
    clearTimeout(this.pongTimeout);
    clearTimeout(this.serverInfoTimeout);
  }

  schedulePing() {
    this.cancelPing();
    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null;
      this.ping();
    }, PING_TIME);
  }

  cancelPing() {
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  ping() {
    this.connector.send('ping');
    this.startPongTimeout();
  }

  startPongTimeout() {
    this.cancelPongTimeout();
    this.pongTimeout = setTimeout(() => {
      this.pongTimeout = null;
      console.warn(`PONG not received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Resetting connection.');
      this.connector.close();
    }, PONG_WAIT_TIME);
  }

  cancelPongTimeout() {
    if (this.pongTimeout !== null) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  scheduleServerInfoTimeout() {
    this.cancelServerInfoTimeout();
    this.serverInfoTimeout = setTimeout(() => {
      this.serverInfoTimeout = null;
      console.warn(`No serverInfo received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Resetting connection');
      this.connector.close();
    }, PONG_WAIT_TIME);
  }

  cancelServerInfoTimeout() {
    if (this.serverInfoTimeout !== null) {
      clearTimeout(this.serverInfoTimeout);
      this.serverInfoTimeout = null;
    }
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'sync') {
      this.handleSync(message);
    } else if (message.type === 'pong') {
      this.handlePong();
    } else if (message.type === 'serverInfo') {
      this.handleServerInfo(message);
    }
  }

  handleSync(message) {
    this.connector.onSync(message);
  }

  handlePong() {
    this.cancelPongTimeout();
    this.schedulePing();
  }

  handleServerInfo(message) {
    this.cancelServerInfoTimeout();
    this.connector.onServerId(message.serverID);
  }
}

module.exports = OpenState;
