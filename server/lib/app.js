/* eslint-disable no-console */
const EventEmitter = require('events');
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');

function initApp(config) {
  console.log('Initializing server.');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    OpenApiValidator.middleware({
      apiSpec: '../specs/openapi.yaml',
      validateRequests: true,
      validateResponses: true,
    }),
  );

  app.get('/config', (req, res) => {
    res.json(config);
  });

  function sendPong(socket) {
    socket.send(JSON.stringify({
      type: 'pong',
    }));
  }

  const wss = new ws.Server({ noServer: true, clientTracking: true });

  wss.on('connection', (socket) => {
    console.log(`Connected (${wss.clients.size} clients)`);

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (typeof message === 'object' && typeof message.type === 'string') {
        switch (message.type) {
          case 'ping':
            sendPong(socket);
            break;
          default:
            console.warn(`Error: Received message of unknown type '${message.type}'`);
            break;
        }
      } else {
        console.error('Error: Received invalid message via websocket');
        console.trace(message);
      }
    });

    socket.on('close', (code, reason) => {
      console.log(`Socket closed (code: ${code} reason: '${reason}')`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (code: ${err.code})`);
      console.error(err);
    });
  });

  wss.on('close', () => {
    console.error('WebSocket Server closed');
  });

  wss.on('error', (err) => {
    console.error(`WebSocket Server error: ${err.message}`);
    console.error(err);
  });

  wss.on('wsClientError', (err) => {
    console.error(`WebSocket Server client error: ${err.message}`);
    console.error(err);
  });

  return [app, wss];
}

module.exports = initApp;
