const Sentry = require('@sentry/node');

function reportError(error) {
  // If error is a string
  if (typeof error === 'string') {
    console.error(error);
    Sentry.captureMessage(error);
  } else {
    console.error(error.message);
    console.error(error.stack);
    Sentry.captureException(error);
  }
}

module.exports = reportError;
