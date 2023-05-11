const ServerSocketConnector = require('./lib/net/server-socket-connector');
const ConnectionStateView = require('./lib/net/connection-state-view');
const showFatalError = require('./lib/loader/show-fatal-error');
require('../sass/default.scss');
const PlayerApp = require('./lib/components/player-app');
const { getApiServerUrl, getSocketServerUrl } = require('./lib/net/server-url');
const PingStats = require('./lib/net/ping-stats');

const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get('p') || '1';
const statsPanel = urlParams.get('s') || null;
const configUrl = `${getApiServerUrl()}config`;

fetch(configUrl, { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${ response.status }`);
    }
    return response.json();
  })
  .catch((err) => {
    console.log(err);
    showFatalError(`Error fetching configuration from ${configUrl}`, err);
    console.error(`Error fetching configuration from ${configUrl}`);
    throw err;
  })
  .then((config) => {
    const playerApp = new PlayerApp(config, playerId);
    return playerApp.init();
  })
  .then((playerApp) => {
    $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
    playerApp.resize();
    $(window).on('resize', () => {
      playerApp.resize();
    });

    const pingStats = new PingStats();
    playerApp.addStats(pingStats.panel);
    let syncReceived = false;
    const connector = new ServerSocketConnector(getSocketServerUrl());
    connector.events.on('connect', () => {
      syncReceived = true;
    });
    connector.events.on('sync', (message) => {
      syncReceived = true;
      pingStats.update();
      Object.entries(message.players).forEach(([id, player]) => {
        if (id !== playerId && playerApp.otherPcs[id]) {
          if (player.position) {
            playerApp.otherPcs[id].setPosition(player.position.x, player.position.y);
          }
          if (player.speed) {
            playerApp.otherPcs[id].setSpeed(player.speed.x, player.speed.y);
          }
        }
      });
    });
    playerApp.pixiApp.ticker.add(() => {
      if (syncReceived) {
        connector.sync(playerApp.pc);
        syncReceived = false;
      }
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);

    if (statsPanel) {
      playerApp.showStats(Number(statsPanel));
    }
  })
  .catch((err) => {
    console.error(err);
  });
