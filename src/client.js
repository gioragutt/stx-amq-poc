require('app-module-path').addPath(__dirname)

const cli = require('./lib/cli')

const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {
  activeMqHost,
  activeMqPort,
  activeMqUsername,
  activeMqPassword,
} = require('config')

const QueueRpcClient = require('./lib/client')

const connectOptions = {
  host: activeMqHost,
  port: activeMqPort,
  connectHeaders: {
    login: activeMqUsername,
    passcode: activeMqPassword,
  },
}

const callMethodOnClient = (log, client, {timeout, ...restOfOptions}, methodName, params) => {
  methodName = methodName.toUpperCase()
  return client.callMethod(methodName, params || {}, {timeout: timeout || 3000, restOfOptions})
    .then(({body}) => log(`> ${body}`))
    .catch(log)
}

const callMethod =
  (client, method, argsMapper = () => undefined) =>
    (log, args, options) =>
      callMethodOnClient(log, client, options, method, argsMapper(args))

logger.info('Connecting to ActiveMQ')
QueueRpcClient.connect(connectOptions).then((client) => {
  logger.info('Connected')
  const commands = [
    {
      command: 'add <number>',
      description: 'Add a number to the list',
      alias: 'a',
      action: callMethod(client, 'ADD', a => a.number),
    },
    {
      command: 'remove <number>',
      description: 'Removes a number from the list',
      alias: 'rm',
      action: callMethod(client, 'REMOVE', a => a.number),
    },
    {
      command: 'query',
      description: 'Shows the list',
      alias: 'ls',
      action: callMethod(client, 'QUERY'),
    },
    {
      command: 'clear',
      description: 'Clears the list',
      alias: 'c',
      action: callMethod(client, 'CLEAR'),
    },
  ]

  cli(commands, {delimiter: 'ActiveMq$'})
}).catch(e => logger.error(e, 'failed to connect to ActiveMQ'))
