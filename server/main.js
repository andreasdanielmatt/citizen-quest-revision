/* eslint-disable no-console */
const Sentry = require('@sentry/node');
const yargs = require('yargs');
const yaml = require('js-yaml');
const { hideBin } = require('yargs/helpers');
const createServer = require('./lib/server');
const CfgLoader = require('../src/js/lib/loader/cfg-loader');
const CfgReaderFile = require('../src/js/lib/loader/cfg-reader-file');
const { validateStoryline } = require('../src/js/lib/model/storyline-validation');
const storylineLoader = require('../src/js/lib/loader/storyline-loader');

const { port, settingsFile, sentryDsn } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4850',
    coerce: (opt) => Number.parseInt(opt, 10),
  })
  .option('s', {
    alias: 'settings-file',
    default: process.env.SETTINGS_FILE || '../settings.yml',
  })
  .option('sentry-dsn', {
    default: process.env.SENTRY_DSN || null,
  })
  .argv;

if (sentryDsn) {
  console.log('Initializing Sentry');
  Sentry.init({ dsn: sentryDsn });
}

const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);
cfgLoader.load([
  '../config/game.yml',
  '../config/net.yml',
  '../config/players.yml',
  '../config/i18n.yml',
  '../config/textures.yml',
  '../config/town.yml',
  '../config/gamepads.yml',
  '../config/storylines.yml',
  settingsFile,
])
  .then((config) => (
    storylineLoader(cfgLoader, '../config/storylines', config.storylines)
      .then((storylines) => {
        config.storylines = storylines;
        return config;
      })
  ))
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
    Sentry.captureException(err);
    process.exit(1);
  })
  .then((config) => {
    createServer(port, config);
    console.log(`Listening on port ${port}`);
  })
  .catch((err) => {
    console.error(err);
    Sentry.captureException(err);
  });
