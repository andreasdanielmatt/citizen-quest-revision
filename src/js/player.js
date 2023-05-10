const ServerSocketConnector = require('./lib/net/server-socket-connector');
const ConnectionStateView = require('./lib/net/connection-state-view');
const showFatalError = require('./lib/loader/show-fatal-error');
require('../sass/default.scss');
const PlayerApp = require('./lib/components/player-app');

const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get('p') || '1';

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${ response.status }`);
    }
    return response.json();
  })
  .catch((err) => {
    console.log(err);
    showFatalError(`Error fetching configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error fetching configuration from ${process.env.SERVER_HTTP_URI}`);
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

    const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);
    connector.events.on('connect', () => {
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);
  })
  .catch((err) => {
    console.error(err);
  });
