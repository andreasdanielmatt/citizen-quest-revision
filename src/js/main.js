const yaml = require('js-yaml');
const CfgReaderFetch = require('./lib/loader/cfg-reader-fetch');
const CfgLoader = require('./lib/loader/cfg-loader');
const showFatalError = require('./lib/loader/show-fatal-error');
const PlayerApp = require('./lib/components/player-app');
require('../sass/default.scss');

const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
cfgLoader.load([
  'config/players.yml',
  'config/textures.yml',
  'config/town.yml',
]).catch((err) => {
  showFatalError('Error loading configuration', err);
  console.error('Error loading configuration');
  console.error(err);
}).then((config) => {
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
});
