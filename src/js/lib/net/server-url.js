function withLeadingSlash(str) {
  return str[0] === '/' ? str : `/${str}`;
}

function withTrailingSlash(str) {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}

function withTrailingColon(str) {
  return str[str.length - 1] === ':' ? str : `${str}:`;
}

function getApiServerUrl() {
  const protocol = withTrailingColon(process.env.API_SERVER_PROTOCOL || window.location.protocol);
  const host = process.env.API_SERVER_HOST || window.location.hostname;
  const port = process.env.API_SERVER_PORT || window.location.port;
  const root = withTrailingSlash(withLeadingSlash(process.env.API_SERVER_ROOT || '/'));

  return `${protocol}//${host}:${port}${root}`;
}

function getSocketServerUrl() {
  const protocol = withTrailingColon(process.env.SOCKET_SERVER_PROTOCOL || 'ws');
  const host = process.env.SOCKET_SERVER_HOST || window.location.hostname;
  const port = process.env.SOCKET_SERVER_PORT || window.location.port;
  const root = withTrailingSlash(withLeadingSlash(process.env.SOCKET_SERVER_ROOT || '/'));

  return `${protocol}//${host}:${port}${root}`;
}

module.exports = {
  getApiServerUrl,
  getSocketServerUrl,
};
