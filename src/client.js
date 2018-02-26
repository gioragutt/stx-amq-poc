require('app-module-path').addPath(__dirname)

const pino = require('pino')
const cli = require('./lib/cli')
const {activeMqHost, activeMqPort, activeMqUsername, activeMqPassword, logLevel} = require('config')
const MqClient = require('./lib/client')

const pretty = pino.pretty()
pretty.pipe(process.stdout)
const logger = pino({}, pretty)

logger.level = logLevel

const connectOptions = {
  host: activeMqHost,
  port: activeMqPort,
  connectHeaders: {
    login: activeMqUsername,
    passcode: activeMqPassword,
  },
}

const defaultOptions = {
  timeout: 3000,
}

const callMethodOnClient = (client, methodName, args, options) => client
  .call(methodName, args || {}, {...defaultOptions, ...options})
  .then(({body}) => logger.info(body))
  .catch(e => logger.error(e))

const callMethod = (client, method, argsMapper = a => a) => (args, options) =>
  callMethodOnClient(client, method, argsMapper(args), options)

logger.info('Connecting to ActiveMQ')
MqClient.connect(connectOptions, {logger})
  .then((client) => {
    logger.info('Connected')
    const commands = [
      {
        command: 'add <number>',
        description: 'Add a number to the list',
        alias: 'a',
        action: callMethod(client, 'add'),
      },
      {
        command: 'remove <number>',
        description: 'Removes a number from the list',
        alias: 'rm',
        action: callMethod(client, 'remove'),
      },
      {
        command: 'query',
        description: 'Shows the list',
        alias: 'ls',
        action: callMethod(client, 'query'),
      },
      {
        command: 'clear',
        description: 'Clears the list',
        alias: 'c',
        action: callMethod(client, 'clear'),
      },
      {
        command: 'echo <message...>',
        action: callMethod(client, 'echo', ({message, ...rest}) => ({message: message.join(' '), ...rest})),
      },
    ]

    cli(commands, {delimiter: 'ActiveMq $', onExit: () => client.disconnect()})
  })
  .catch(e => logger.error(e, 'failed to connect to ActiveMQ'))
