/* eslint-disable no-console */
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const PlayerCharacter = require('../../src/js/lib/model/player-character');

function initApp(config) {
  console.log('Initializing server.');

  const players = Object.fromEntries(Object.entries(config.players)
    .filter(([, player]) => player.enabled === undefined || player.enabled)
    .map(([id]) => [id, new PlayerCharacter(config, id)]));

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

  function processSync(message) {
    if (message.players) {
      Object.entries(message.players).forEach(([id, props]) => {
        if (players[id] === undefined) {
          console.error(`Error: Received sync data for unknown player ${id}`);
        }
        if (props.position) {
          players[id].setPosition(props.position.x, props.position.y);
        }
        if (props.speed) {
          players[id].setSpeed(props.speed.x, props.speed.y);
        }
      });
    }
  }

  function sendSync(socket) {
    socket.send(JSON.stringify({
      type: 'sync',
      players: Object.values(players).reduce((acc, player) => {
        acc[player.id] = {
          position: player.position,
          speed: player.speed,
        };
        return acc;
      }, {}),
    }));
  }

  function sendPong(socket) {
    socket.send(JSON.stringify({
      type: 'pong',
    }));
  }

  const wss = new ws.Server({ noServer: true, clientTracking: true });

  wss.on('connection', (socket, request) => {
    const ip = socket._socket.remoteAddress;
    console.log(`Client connected from ${ip}`);
    console.log(`Connected (${wss.clients.size} clients)`);

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (typeof message === 'object' && typeof message.type === 'string') {
        switch (message.type) {
          case 'sync':
            processSync(message);
            sendSync(socket);
            break;
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
