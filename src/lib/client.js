const stompit = require('stompit')
const uuid = require('uuid')
const {sendRpc, subscribeToQueue} = require('./mq')
const {loggers: {logger: wdLogger}} = require('@welldone-software/node-toolbelt')
const {requestQueueName, responseQueueName, stripSlash, parseConnectionString} = require('./utils')

const setRpcTimeout = (reject, timeout) => {
  if (timeout > 0) {
    setTimeout(() => {
      reject(new Error(`RPC request timed out after ${timeout} ms`))
    }, timeout)
  }
}

class MqClient {
  /**
   * Create a QueueRpc API Client
   * @param {*} stompitClient an instance of the `stompit`
   * @requires stompit
   * {@link http://gdaws.github.io/node-stomp/api/}
   */
  constructor(stompitClient, {id, logger = wdLogger} = {}) {
    this.client = stompitClient
    this.logger = logger.child({name: 'QueueRpcClient'})
    this.subscriptions = {}
    this.subscribers = {}
    this.methodToQueueName = {}
    this.id = id || uuid()
  }

  /**
   * Listen to events emitted by the stompit client
   * @param {String} type type of the event
   * @param {Function} listener event handler
   */
  on(type, listener) {
    this.logger.debug('listening to event on stompit client', {type, listener})
    this.client.on(type, listener)
    return this
  }

  getSubscriber(destination) {
    return (correlationId) => {
      const subscriber = (this.subscribers[destination] || {})[correlationId]
      if (subscriber) {
        delete this.subscribers[destination][correlationId]
      }
      return subscriber
    }
  }

  ensureSubscriptionToResponse(destination) {
    if (!this.subscriptions[destination]) {
      this.subscriptions[destination] =
        subscribeToQueue(this.client, this.logger, destination, this.getSubscriber(destination))
      this.logger.debug(`started listening to responses for ${destination}`)
    }
  }

  subscribeCaller(responseQueue, correlationId, timeout) {
    return new Promise((resolve, reject) => {
      setRpcTimeout(reject, timeout)
      this.subscribers[responseQueue] = this.subscribers[responseQueue] || {}
      this.subscribers[responseQueue][correlationId] = {resolve, reject}
    })
  }

  /**
   * Calls a method and awaits a response from the server
   * @param {String} method name of the method
   * @param {Object|*} params parameters to call the method with
   * @param {Object} options optional metadata, f.e headers and timeout
   */
  call(method, params, options = {}) {
    method = stripSlash(method)
    const responseQueue = responseQueueName(method, this.id)
    const correlationId = uuid()

    this.ensureSubscriptionToResponse(responseQueue)
    this.logger.debug({method, params, options}, 'calling method')

    const {timeout, ...rpcOptions} = options
    const responsePromise = this.subscribeCaller(responseQueue, correlationId, options.timeout)

    sendRpc(
      this.client,
      params,
      requestQueueName(method),
      correlationId,
      responseQueue,
      rpcOptions,
      this.logger
    )

    return responsePromise
  }

  /**
   * Peacefully disconnect the stompit connection
   */
  disconnect() {
    this.logger.info('disconnecting client')
    Object.values(this.subscriptions).forEach(s => s.unsubscribe())
    this.subscriptions = {}
    this.subscribers = {}
    this.client.disconnect()
  }
}

/**
 * Create a {@link MqClient} with given configuration and options
 * @param {String|Object} config configuration for the STOMP client
 * Can be either a connection string, or an object of the following form:
 * const connectOptions = {url: String} or
 * const connectOptions = {
 *   host: String,
 *   port: Number,
 *   connectHeaders: {
 *     login?: String,
 *     passcode?: String,
 *  },
 * }
 * @param {[Object]} options options for the wrapper client
 * @see {@link MqClient#constructor} for available options
 */
MqClient.connect = (configOrConnectionString, options) => {
  const config = typeof configOrConnectionString === 'string'
    ? parseConnectionString(configOrConnectionString)
    : configOrConnectionString
  return new Promise((resolve, reject) =>
    stompit.connect(config, (error, stompitClient) => {
      if (error) {
        reject(error)
        return
      }
      resolve(new MqClient(stompitClient, options))
    }))
}

module.exports = MqClient
