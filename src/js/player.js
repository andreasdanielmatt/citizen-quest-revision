const ServerSocketConnector = require('./lib/net/server-socket-connector');
const ConnectionStateView = require('./lib/net/connection-state-view');
const showFatalError = require('./lib/loader/show-fatal-error');
require('../sass/default.scss');
const { getApiServerUrl, getSocketServerUrl } = require('./lib/net/server-url');
const { initSentry } = require('./lib/helpers/sentry');
const PlayerApp = require('./lib/app/player-app');
const fetchConfig = require('./lib/helpers-client/fetch-config');
const fetchTextures = require('./lib/helpers-client/fetch-textures');

(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('p') || '1';
    const statsPanel = urlParams.get('s') || null;
    const configUrl = `${getApiServerUrl()}config`;

    const sentryDSN = urlParams.get('sentry-dsn') || process.env.SENTRY_DSN;
    if (sentryDSN) {
      initSentry(sentryDSN);
    }

    const config = await fetchConfig(configUrl);
    const textures = await fetchTextures('./static/textures', config.textures, 'town-view');
    const playerApp = new PlayerApp(config, textures, playerId);

    $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
    playerApp.resize();
    $(window).on('resize', () => {
      playerApp.resize();
    });

    let syncReceived = false;
    const connector = new ServerSocketConnector(getSocketServerUrl());
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);

    connector.events.on('connect', () => {
      syncReceived = true;
    });
    connector.events.on('sync', (message) => {
      syncReceived = true;
      playerApp.stats.ping();
      Object.entries(message.players).forEach(([id, player]) => {
        if (id !== playerId && playerApp.remotePcs[id]) {
          if (player.position) {
            playerApp.remotePcs[id].setPosition(player.position.x, player.position.y);
          }
          if (player.speed) {
            playerApp.remotePcs[id].setSpeed(player.speed.x, player.speed.y);
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

    if (statsPanel) {
      playerApp.stats.showPanel(statsPanel);
    }
  } catch (err) {
    showFatalError(err.message, err);
    console.error(err);
  }
})();
