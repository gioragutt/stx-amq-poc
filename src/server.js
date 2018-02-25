require('app-module-path').addPath(__dirname)

const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {activeMqHost, activeMqPort, activeMqUsername, activeMqPassword, logLevel} = require('config')
const QueueRpcServer = require('lib/server')
const QueueRpcRouter = require('lib/router')
const Database = require('app/database')

logger.level = logLevel

const connectOptions = {
  host: activeMqHost,
  port: activeMqPort,
  connectHeaders: {
    login: activeMqUsername,
    passcode: activeMqPassword,
  },
}

const db = new Database()

const readWriteRouter = new QueueRpcRouter()
readWriteRouter.respondTo('add', ({body: {number}}) => db.add(number))
readWriteRouter.respondTo('remove', ({body: {number}}) => db.remove(number))
readWriteRouter.respondTo('clear', () => db.clear())

const readOnlyRouter = new QueueRpcRouter()
readOnlyRouter.respondTo('query', () => db.query())
readOnlyRouter.respondTo('echo', ({body: {message}}) => message)

const server = new QueueRpcServer()
server.use(readWriteRouter)
server.use(readOnlyRouter)

server
  .start(connectOptions)
  .then(config => logger.info(config, 'connected to active mq'))
  .catch(error => logger.error({error}, 'failed to connect to active mq'))
