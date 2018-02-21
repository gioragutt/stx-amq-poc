# Intoduction

This POC project implements RPC using `ActiveMQ` as a message queue.

The POC implements an API that allows the RPC sender to send the RPC and receive a promise back,  
which allows writing clear and simple code, without spreading your logic across your code (due to the callback-y style of handling messages in PUBSUB).

# Technology

* The `stompit` library is used to communicate with the ActiveMQ server via the `STOMP` protocol.
* For running an ActiveMQ instance, we use the `rmohr/activemq` docker image

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

```bash
ENV1=VAL1 ... ENVN=VALN npm run client
```
will send a message

ENV(1-N) stand for variables for the client (due to pino, cannot pass command line variables)

Useful variables:

* **MESSAGE** - the message to send to in the RPC request
  * default value: **'echo test'**
* **TIMEOUT** - when given value above 0, will time out the request if the given time has passed
  * unit: **milliseconds**
  * default value: **3000**

*Example* -
```bash
TIMEOUT=100 MESSAGE="this is ducking awesome!" npm run client
```

# All environment variables (.env.example)

* **ACTIVE_MQ_HOST** - host of the ActiveMQ instance (f.e *localhost*)
* **ACTIVE_MQ_PORT** - port of the ActiveMQ instance `STOMP` endpoint (f.e *61613*)
* **ACTIVE_MQ_USERNAME** - `optional` username for authentification
* **ACTIVE_MQ_PASSWORD** - `optional` password for authentification
* **REQUEST_QUEUE** - name of the queue to which the requests will be sent (f.e *Requests*)
* **RESPONSE_QUEUE** - name of the queue to which the responses will be sent (f.e *Responses*)
* **MESSAGE** - explained above, ***client use only***
* **TIMEOUT** - explained above, ***client use only***
