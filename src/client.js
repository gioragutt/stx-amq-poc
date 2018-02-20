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
} = require('config')

const sendMessageAndAwaitResponse = require('lib/mq')

const message = process.argv.length > 0 ? process.argv.join(' ') : 'no message'

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
  sendMessageAndAwaitResponse(client, {message}, requestQueue, responseQueue)
    .then(msg => logger.info(msg, 'received message'))
    .catch(err => logger.error(err, 'god damnit'))
})
