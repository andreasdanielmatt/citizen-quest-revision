const yaml = require('js-yaml');
const CfgReaderFetch = require('./lib/loader/cfg-reader-fetch');
const CfgLoader = require('./lib/loader/cfg-loader');
const showFatalError = require('./lib/loader/show-fatal-error');
const PlayerApp = require('./lib/components/player-app');
require('../sass/default.scss');

const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
cfgLoader.load([
  'config/textures.yml',
  'config/town.yml',
]).catch((err) => {
  showFatalError('Error loading configuration', err);
  console.error('Error loading configuration');
  console.error(err);
}).then((config) => {
  const playerApp = new PlayerApp(config);
  return playerApp.init();
}).then((playerApp) => {
  $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
  playerApp.resize();
  $(window).on('resize', () => {
    playerApp.resize();
  });
});
