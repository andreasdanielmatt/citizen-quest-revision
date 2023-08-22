/* eslint-disable no-console */
const EventEmitter = require('events');

const CONNECT_TIMEOUT = 1000 * 30;
const PING_TIME = 1000 * 10;
const PONG_WAIT_TIME = 1000 * 10;
const CLOSE_TIMEOUT = 1000 * 15;
const RECONNECT_TIME = 1000 * 5;

class ServeSocketConnectorState {
  constructor(connector) {
    this.connector = connector;
  }

  // eslint-disable-next-line class-methods-use-this
  onEnter() { }

  // eslint-disable-next-line class-methods-use-this
  onExit() { }

  onMessage(event) {
    const className = this.constructor.name;
    console.error(`Unhandled message in ${className}:`, event.data);
  }
}

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

class ServerSocketConnector {
  constructor(uri) {
    this.uri = uri;
    this.ws = null;
    this.events = new EventEmitter();
    this.state = null;

    this.autoReconnect = true;
    this.serverId = null;

    // Add a handler for the page being closed or refreshed
    const terminationEvent = 'onpagehide' in window.self ? 'pagehide' : 'unload';
    window.addEventListener(terminationEvent, (event) => {
      if (event.persisted === false && this.ws) {
        this.destroySocket();
      }
    });

    this.connect();
  }

  setState(state) {
    if (this.state) {
      this.state.onExit();
    }
    this.state = state;
    if (this.state) {
      this.state.onEnter();
    }
  }

  destroySocket() {
    this.setState(null);

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  connect() {
    this.destroySocket();

    console.log(`Connecting to ${this.uri}...`);
    this.events.emit('connecting');
    this.ws = new WebSocket(this.uri);
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);

    this.setState(new ConnectingState(this));
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
  }

  // To do: Move this outside of this class
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

  addPlayer(playerID) {
    this.send({
      type: 'addPlayer',
      playerID,
    });
  }

  removePlayer(playerID) {
    this.send({
      type: 'removePlayer',
      playerID,
    });
  }

  playerReady(state, playerID) {
    this.send({
      type: 'playerReady',
      state,
      playerID,
    });
  }

  close() {
    if (this.ws) {
      console.log('Closing connection...');
      this.events.emit('closing');
      this.ws.close();
    }
    this.setState(new ClosingState(this));
  }

  onClose() {
    if (this.autoReconnect) {
      this.setState(new ReconnectDelayState(this));
    } else {
      this.destroySocket();
    }
  }

  onServerId(serverId) {
    if (this.serverId === null) {
      this.serverId = serverId;
    } else if (this.serverId !== serverId) {
      console.warn(`The server has a new serverID (${serverId}). The client must be reloaded.`);
      this.events.emit('server-relaunched');
      this.destroySocket();
    }
  }

  onSync(message) {
    this.events.emit('sync', message);
  }

  handleOpen() {
    console.log('Connected.');
    this.events.emit('connect');
    this.setState(new OpenState(this));
  }

  handleClose(event) {
    // event.code is defined here https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    // but according to people the only code one normally gets is 1006 (Abnormal Closure)
    console.warn(
      `Disconnected with code ${event.code}`,
      event.code === 1006 ? ': Abnormal closure' : '',
      event.reason ? `(reason: ${event.reason})` : ''
    );
    this.events.emit('disconnect');
    this.onClose();
  }

  handleMessage(event) {
    if (this.state) {
      this.state.onMessage(event);
    } else {
      console.error('Received message while in an unknown stateHandler:', event.data);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleError(event) {
    // No behaviour beyond logging because as far as we tested, the event does not provide any
    // useful information and the close event should also be raised.
    console.warn('WebSocket error:', event);
  }
}

module.exports = ServerSocketConnector;
