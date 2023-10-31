/* eslint-disable no-console */
const yaml = require('js-yaml');
const CfgReaderFetch = require('./lib/loader/cfg-reader-fetch');
const CfgLoader = require('./lib/loader/cfg-loader');
const showFatalError = require('./lib/loader/show-fatal-error');
const PlayerApp = require('./lib/app/player-app');
const LocalGameServerController = require('./lib/app/local-game-server-controller');
const { initSentry } = require('./lib/helpers/sentry');
require('./lib/live-test/live-test-manager');
require('./lib/live-test/dialogue-live-tester');
require('../sass/default.scss');
const fetchTextures = require('./lib/helpers-client/fetch-textures');
const StorylineManager = require('./lib/model/storyline-manager');
const storylineLoader = require('./lib/loader/storyline-loader');

(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const statsPanel = urlParams.get('s') || null;
    const liveTest = urlParams.get('test') || null;
    const storylineId = urlParams.get('storyline') || null;

    const sentryDSN = urlParams.get('sentry-dsn') || process.env.SENTRY_DSN;
    if (sentryDSN) {
      initSentry(sentryDSN);
    }

    const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
    const config = await cfgLoader.load([
      'config/game.yml',
      'config/players.yml',
      'config/i18n.yml',
      'config/textures.yml',
      'config/town.yml',
      'config/gamepads.yml',
      'config/storylines.yml',
    ]).catch((err) => {
      throw new Error(`Error loading configuration: ${err.message}`);
    });

    config.storylines = await storylineLoader(cfgLoader, 'config/storylines', config.storylines)
      .catch((err) => {
        throw new Error(`Error loading configuration: ${err.message}`);
      });

    const textures = await fetchTextures('./static/textures', config.textures, 'town-view');

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
    const storylineManager = new StorylineManager(config);
    const playerApp = new PlayerApp(config, textures, playerId);
    $('[data-component="PlayerApp"]').replaceWith(playerApp.$element);
    playerApp.refresh();

    playerApp.setGameServerController(new LocalGameServerController(playerApp));
    playerApp.setStoryline(storylineId || storylineManager.getFirst());

    if (statsPanel) {
      playerApp.stats.showPanel(statsPanel);
    }

    if (liveTest) {
      window.IMAGINARY.liveTestManager.run(playerApp, liveTest);
    }
  } catch (err) {
    showFatalError(err.message, err);
    console.error(err);
  }
})();
