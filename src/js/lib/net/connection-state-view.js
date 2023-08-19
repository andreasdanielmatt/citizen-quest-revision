const icon = require('../../../../static/fa/broadcast-tower-solid.svg');

const RELAUNCH_DELAY_SECONDS = 5;

class ConnectionStateView {
  constructor(connector) {
    this.relaunching = false;

    this.$element = $('<div></div>')
      .addClass('connection-state-view');

    this.$icon = $('<img>')
      .attr('src', icon)
      .addClass('connection-state-view-icon')
      .appendTo(this.$element);

    this.$errorMessage = $('<div></div>')
      .addClass('connection-state-view-error text-danger')
      .appendTo(this.$element);
    this.$errorStatus = $('<div></div>')
      .addClass('connection-state-view-status')
      .appendTo(this.$element);

    connector.events.on('closing', this.handleClosing.bind(this));
    connector.events.on('disconnect', this.handleDisconnect.bind(this));
    connector.events.on('connectWait', this.handleConnectWait.bind(this));
    connector.events.on('connecting', this.handleConnecting.bind(this));
    connector.events.on('connect', this.handleConnect.bind(this));
    connector.events.on('server-relaunched', this.handleServerRelaunched.bind(this));
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }

  setErrorMessage(message) {
    this.$errorMessage.html(message);
  }

  setErrorStatus(status) {
    this.$errorStatus.html(status);
  }

  handleClosing() {
    if (this.relaunching) {
      return;
    }
    this.setErrorMessage('Connection closed');
    this.setErrorStatus('Will retry in a few seconds.');
    this.show();
  }

  handleDisconnect() {
    if (this.relaunching) {
      return;
    }
    this.setErrorMessage('Disconnected from server');
    this.setErrorStatus('');
    this.show();
  }

  handleConnectWait() {
    this.setErrorStatus('Waiting to reconnect...');
  }

  handleConnecting() {
    this.setErrorStatus('Connecting...');
  }

  handleConnect() {
    this.hide();
  }

  handleServerRelaunched() {
    this.relaunching = true;
    this.setErrorMessage('The server was restarted.<br />Reloading in');
    this.setErrorStatus(`${RELAUNCH_DELAY_SECONDS} seconds`);
    this.show();

    let secondsLeft = RELAUNCH_DELAY_SECONDS;
    const interval = setInterval(() => {
      secondsLeft -= 1;
      this.setErrorStatus(`${secondsLeft} seconds`);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);
  }
}

module.exports = ConnectionStateView;
