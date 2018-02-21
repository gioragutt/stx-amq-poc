require('app-module-path').addPath(__dirname)

const stompit = require('stompit')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {activeMqHost, activeMqPort, activeMqUsername, activeMqPassword, requestQueue} = require('config')
const {respondToRpc} = require('lib/mq')

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
  client.subscribe({destination: requestQueue}, (subscriptionError, message) => {
    if (subscriptionError) {
      logger.error(subscriptionError, 'subscription error')
      return
    }

    logger.info({headers: message.headers}, 'received message')

    respondToRpc(client, message)
      .catch(error => logger.error(error, 'error responding to rpc'))
      .then(response => logger.info(response, 'successfully responded to rpc'))
  })
})
