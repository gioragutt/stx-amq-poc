require('app-module-path').addPath(__dirname)

const stompit = require('stompit')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {activeMqHost, activeMqPort, activeMqUsername, activeMqPassword, requestQueue} = require('config')

const connectOptions = {
  host: activeMqHost,
  port: activeMqPort,
  connectHeaders: {
    login: activeMqUsername,
    passcode: activeMqPassword,
  },
}

logger.info('attempting to connect to active mq')
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

    logger.info(message, 'received message')
  })
})
