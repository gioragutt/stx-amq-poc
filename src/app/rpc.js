const pino = require('pino')
const {
  activeMqPath, activeMqHost, activeMqPort, activeMqUsername, activeMqPassword, logLevel,
} = require('config')
const MqClient = require('lib/client')

const pretty = pino.pretty()
pretty.pipe(process.stdout)
const logger = pino({}, pretty)

logger.level = logLevel

const connectOptions = activeMqPath || {
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

const connectionPromise = MqClient.connect(connectOptions, {logger})
  .catch(e => logger.error(e, 'failed to connect to ActiveMQ'))

const rpc =
  (method, body = {}, headers = {}) =>
    connectionPromise.then(client =>
      client.call(method, body, {...defaultOptions, headers}))

module.exports = {rpc, logger}
