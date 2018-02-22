require('app-module-path').addPath(__dirname)

const program = require('commander')

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

const callMethodOnClient = (client, options, methodName, params) => {
  methodName = methodName.toUpperCase()
  logger.info(`calling ${methodName} method${params ? ` with ${params}` : ''}`)
  client.callMethod(methodName, params || {}, options)
    .then((response) => {
      logger.info(response, 'success')
      client.disconnect()
    })
    .catch((e) => {
      logger.error(e, 'failure')
      client.disconnect()
    })
}

const getOptions = () => ({timeout: program.timeout})

const callMethod = (...args) => {
  QueueRpcClient.connect(connectOptions)
    .then(client => callMethodOnClient(client, getOptions(), ...args))
    .catch(e => logger.error(e, 'failed to connect to ActiveMQ'))
}

program
  .version('0.1.0')
  .option('-t, --timeout <path>', 'set timeout (ms)', 3000)

program
  .command('add <number>')
  .description('adds <number> to the list')
  .action(number => callMethod('add', number))

program
  .command('remove <number>')
  .description('removes <number> from the list')
  .action(number => callMethod('remove', number))

program
  .command('query')
  .description('queries the list')
  .action(() => callMethod('query'))

program
  .command('clear')
  .description('clears the list')
  .action(() => callMethod('clear'))

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
