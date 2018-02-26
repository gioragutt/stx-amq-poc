# Intoduction

* This POC project implements RPC using `ActiveMQ` as a message queue.

* The POC implements an API that allows the RPC sender to send the RPC and receive a promise back,  
which allows writing clear and simple code, without spreading your logic across your code (due to the callback-y style of handling messages in PUBSUB).

* The server API tries to resemble that of express, where you create a server, can attack routers, and then listen.  
There isn't much logic to routers now, but different behaviors can be implemented to each router (f.e authentication, middlewares, etc...)

* The client API resembles that of something like `mongodb`, where you use `MongoClient.connect` which returns a client, on which you can call methods to perform actions on the server.
  * Currently, the only method to interact with the server is the `callMethod` method, which expects a response from the server(aka `RPC`)

# Client and Server

The server in acts as a small database for storing a list of values, and supports the following commands: `ADD`, `REMOVE`, `QUERY`, `CLEAR`

The client is an interactive terminal, so you can just run commands which are sent to the server.

Each command receives an optional `-t/--timeout <ms>` option, defaulting to `3000 ms`

### Available Commands
  * `add <number>`  
  alias: `a`
  * `remove <number>`  
  alias: `rm`
  * `query`  
  alias: `ls`
  * `clear`  
  alias: `c`

# Technology

* `stompit` library - used to communicate with the ActiveMQ server via the `STOMP` protocol.
* For running an ActiveMQ instance, we use the `rmohr/activemq` docker image
* `vorpal` library - used to create an interactive terminal for the client

# Installation

`npm install`  
or  
`yarn install`

# Running ActiveMQ

`docker run -p 61613:61613 -p 8161:8161 -d --name="activemq" rmohr/activemq`

* Port `61613` is ActiveMQ's endpoint for the `STOMP` protocol which we are using
* Port `8161` is the Web Console
  * Credentials for admin console: `admin` for both username and password
* See [rmohr/activemq](https://hub.docker.com/r/rmohr/activemq/) for reference

# Running the POC

## Open terminal for server

`npm start` or `yarn start`.  

This will start the "server-side" of the RPC, aka the side that responsds to RPC requests

## Open terminal for client

`npm run client`

This will open up an interactive terminal for you to run commands.

Start by running the `help` command to see all available commands

Useful variables:

* **LOG_LEVEL** - sets up the `pino` logger level
  * default value: **info**
  * available values: `fatal`, `error`, `warn`, `info`, `debug`, `trace`

*Example* -

```bash
LOG_LEVEL=debug  npm run client
```

# All environment variables (.env.example)

These variables are available for both client and server

* **ACTIVE_MQ_PATH** - connection string to the ActiveMQ instance (f.e *username:password@localhost:61613*)
* **ACTIVE_MQ_HOST** - host of the ActiveMQ instance (f.e *localhost*)
* **ACTIVE_MQ_PORT** - port of the ActiveMQ instance `STOMP` endpoint (f.e *61613*)
* **ACTIVE_MQ_USERNAME** - `optional` username for authentification
* **ACTIVE_MQ_PASSWORD** - `optional` password for authentification
* **LOG_LEVEL** - explained above
