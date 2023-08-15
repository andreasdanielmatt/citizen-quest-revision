/* eslint-disable no-console */
const EventEmitter = require('events');

const PING_TIME = 1000 * 10;
const PONG_WAIT_TIME = 1000 * 10;
const RECONNECT_TIME = 1000 * 5;

class ServerSocketConnector {
  constructor(uri) {
    this.uri = uri;
    this.ws = null;
    this.connected = false;
    this.autoReconnect = true;
    this.serverId = null;
    // Must track isClosing because the socket might enter CLOSING state and not close immediately
    this.isClosing = false;
    this.events = new EventEmitter();
    this.pingTimeout = null;
    this.pongTimeout = null;
    this.reconnectTimeout = null;
    this.serverInfoTimeout = null;
    this.connect();
  }

  connect() {
    this.cancelPing();
    this.cancelReconnect();

    this.events.emit('connecting');
    console.log(`Connecting to ${this.uri}...`);
    this.ws = new WebSocket(this.uri);
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    // ws.onerror is not handled because the event gives no data about the
    // error, and on a connection failure onclose will be called.

    this.connected = false;
  }

  disconnect() {
    console.log('Disconnecting...');
    this.events.emit('disconnecting');
    this.autoReconnect = false;
    this.cancelPing();
    this.cancelReconnect();
    this.close();
  }

  close() {
    if (!this.isClosing) {
      this.isClosing = true;
      this.events.emit('closing');
    }
    this.ws.close();
  }

  cancelReconnect() {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  reconnect() {
    this.cancelReconnect();
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_TIME);
    this.events.emit('connectWait');
    console.log(`Will attempt to reconnect in ${RECONNECT_TIME / 1000} seconds...`);
  }

  handleOpen() {
    this.cancelReconnect();
    this.cancelPongTimeout();

    this.connected = true;
    this.isClosing = false;
    console.log('Connected.');
    this.events.emit('connect');
    this.schedulePing();
  }

  handleClose(ev) {
    this.connected = false;
    this.isClosing = false;
    this.cancelPing();
    this.cancelPongTimeout();
    // ev.code is defined here https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    // but according to people the only code one normally gets is 1006 (Abnormal Closure)
    console.error(
      `Disconnected with code ${ev.code}`,
      ev.code === 1006 ? ': Abnormal closure' : '',
      ev.reason ? `(reason: ${ev.reason})` : ''
    );
    this.events.emit('disconnect');
    if (this.autoReconnect) {
      this.reconnect();
    }
  }

  handleMessage(ev) {
    const message = JSON.parse(ev.data);
    if (message.type === 'sync') {
      this.handleSync(message);
    } else if (message.type === 'pong') {
      this.handlePong();
    } else if (message.type === 'serverInfo') {
      this.handleServerInfo(message);
    }
  }

  handleSync(message) {
    this.events.emit('sync', message);
  }

  handlePong() {
    this.cancelPongTimeout();
    this.schedulePing();
  }

  handleServerInfo(message) {
    this.cancelServerInfoTimeout();
    if (this.serverId === null) {
      this.serverId = message.serverID;
    } else if (this.serverId !== message.serverID) {
      console.warn(`Received serverInfo with different serverID (${message.serverID})`);
      this.events.emit('server-relaunched');
      this.autoReconnect = false;
      this.close();
    }
  }

  send(data) {
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
  }

  cancelPing() {
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  schedulePing() {
    this.cancelPing();
    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null;
      this.ping();
    }, PING_TIME);
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
      console.warn('Closing connection');
      this.close();
    }, PONG_WAIT_TIME);
  }

  cancelServerInfoTimeout() {
    if (this.serverInfoTimeout !== null) {
      clearTimeout(this.serverInfoTimeout);
      this.serverInfoTimeout = null;
    }
  }

  startPongTimeout() {
    this.cancelPongTimeout();
    this.pongTimeout = setTimeout(() => {
      this.pongTimeout = null;
      console.warn(`PONG not received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Closing connection');
      if (!this.isClosing) {
        this.isClosing = true;
        this.events.emit('closing');
      }
      this.ws.close();
    }, PONG_WAIT_TIME);
  }

  ping() {
    this.send('ping');
    this.startPongTimeout();
  }

  sync(player = null) {
    const message = {
      type: 'sync',
    };
    if (player !== null) {
      message.players = Object.fromEntries([[player.id,
        {
          position: player.position,
          speed: player.speed,
        },
      ]]);
    }
    this.send(message);
  }
}

module.exports = ServerSocketConnector;
