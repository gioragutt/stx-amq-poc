const stompit = require('stompit')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const RpcError = require('./exceptions')
const {requestQueueName} = require('./utils')
const {respondToRpc, parseMessage} = require('./mq')

const mergeRouters = routers =>
  routers.reduce(
    (allHandlers, router) =>
      Object.keys(router.methodHandlers).reduce((acc, method) => {
        if (acc[method]) {
          throw new RpcError('handler for method already defined', {method})
        }
        acc[method] = router.methodHandlers[method]
        return acc
      }, allHandlers),
    {}
  )

const subscribeHandler = (client, origin, method, handler) =>
  client.subscribe({destination: origin}, (subscriptionError, message) => {
    if (subscriptionError) {
      logger.error(subscriptionError, 'subscription error')
      return
    }

    parseMessage(message)
      .then((body) => {
        logger.info({headers: message.headers, body}, 'received message')
        return body
      })
      .then(body => respondToRpc(client, message, handler, body))
      .then(({headers, response}) => {
        logger.info({headers, response, origin, method}, 'handled method')
      })
      .catch((error) => {
        logger.error({error, origin, method}, 'error handling method')
      })
  })

const subscribeHandlers = (client, handlers, baseQueueName) =>
  Object.entries(handlers).reduce((acc, [method, handler]) => {
    const origin = requestQueueName(baseQueueName, method)
    const subscription = subscribeHandler(client, origin, method, handler)
    acc[subscription.getId()] = subscription
    return acc
  }, {})

class MqServer {
  constructor() {
    this.routers = []
    this.subscriptions = {}
    this.baseQueueName = 'METHOD'
  }

  use(router) {
    this.routers.push(router)
  }

  start(config) {
    return new Promise((resolve, reject) => {
      stompit.connect(config, (connectionError, client) => {
        if (connectionError) {
          reject(new RpcError('failed to connect to active mq', {config, connectionError}))
          return
        }

        const handlers = mergeRouters(this.routers)
        logger.info(Object.keys(handlers), 'Listening for the following methods')
        this.subscriptions = subscribeHandlers(client, handlers, this.baseQueueName)
        resolve(config)
      })
    })
  }
}

module.exports = MqServer
