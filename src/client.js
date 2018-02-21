require('app-module-path').addPath(__dirname)

const stompit = require('stompit')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {
  activeMqHost,
  activeMqPort,
  activeMqUsername,
  activeMqPassword,
  requestQueue,
  responseQueue,
  message,
  timeout,
} = require('config')

const {sendRpc} = require('lib/mq')

const connectOptions = {
  host: activeMqHost,
  port: activeMqPort,
  connectHeaders: {
    login: activeMqUsername,
    passcode: activeMqPassword,
  },
}

stompit.connect(connectOptions, (connectionError, client) => {
  if (connectionError) {
    logger.error({connectionError}, 'failed to connect to active mq')
    return
  }

  logger.info(connectOptions, 'connected to active mq')
  sendRpc(client, {message}, requestQueue, responseQueue, {timeout})
    .then((response) => {
      logger.info(response, 'received RPC response')
      client.disconnect()
    })
    .catch((error) => {
      logger.error(error, 'error receiving RPC response')
      client.disconnect()
    })
})
