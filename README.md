# future-democracy

An exhibit about the Future of Democracy.

## Compilation

To install the required dependencies run `npm install` in **both** the root directory and the
`server` directory.

You can use `npm run build` or `npm run watch` in the root directory to build the client apps. The
server does not require compilation.

The `.env` file in the root directory contains settings that are applied at compilation time.

## Running

Start the server by running `npm run start` in the `server` directory.

The clients, in the root directory, are:

- `index.html`: Demo/test client .
- `player.html`: Player station client.

## Query strings

The `player.html` client accepts the following query string parameters:
- `p`: Player ID. Defaults to 1.

## Configuration

The configuration files are in the `config` directory. The server has to be reloaded after any changes.
Clients get the configuration from the server through the http API and have to be reloaded after
the server to take any changes.

You can override any of the configuration keys through a `settings.yml` file in the root directory.

The .env file has other configuration keys that affect the environment.

## Server APIs

The server has both an HTTP and a WebSocket API. Their specifications are:

- http: `specs/openapi.yaml`
- ws: `specs/asyncapi.yaml`

You can use [Swagger Editor](https://editor.swagger.io/) and the
[AsyncAPI Playground](https://playground.asyncapi.io/) to format the respective specifications in
a friendly format.

## Debugging tools

Press the 'd' key in the player app to put a stat panel on screen. Each press of 'd' toggles to a
different panel.

## License

Copyright (c) 2023 IMAGINARY gGmbH
Licensed under the MIT license (see LICENSE)
Supported by Futurium gGmbH
