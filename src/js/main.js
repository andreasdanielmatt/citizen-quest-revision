const yaml = require('js-yaml');
const CfgReaderFetch = require('./lib/loader/cfg-reader-fetch');
const CfgLoader = require('./lib/loader/cfg-loader');
const showFatalError = require('./lib/loader/show-fatal-error');
const PlayerApp = require('./lib/app/player-app');
const { initSentry } = require('./lib/helpers/sentry');
require('./lib/live-test/live-test-manager');
require('./lib/live-test/dialogue-live-tester');
require('../sass/default.scss');

const urlParams = new URLSearchParams(window.location.search);
const statsPanel = urlParams.get('s') || null;
const liveTest = urlParams.get('test') || null;

const sentryDSN = urlParams.get('sentry-dsn') || process.env.SENTRY_DSN;
if (sentryDSN) {
  initSentry(sentryDSN);
}

const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
cfgLoader.load([
  'config/game.yml',
  'config/players.yml',
  'config/textures.yml',
  'config/town.yml',
  'config/gamepads.yml',
  'config/storylines/touristen.yml',
]).catch((err) => {
  showFatalError('Error loading configuration', err);
  console.error('Error loading configuration');
  console.error(err);
}).then((config) => {
  if (urlParams.get('t')) {
    config.game.duration = parseInt(urlParams.get('t'), 10);
  }

  const playerId = '1';
  // In this standalone app, disable all players except the first one.
  Object.keys(config.players).forEach((id) => {
    if (id !== playerId) {
      config.players[id].enabled = false;
    }
  });
  const playerApp = new PlayerApp(config, playerId);
  return playerApp.init();
}).then((playerApp) => {
  $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
  playerApp.resize();
  $(window).on('resize', () => {
    playerApp.resize();
  });

  if (statsPanel) {
    playerApp.stats.showPanel(statsPanel);
  }

  if (liveTest) {
    window.IMAGINARY.liveTestManager.run(playerApp, liveTest);
  }
});
