const stompit = require('stompit')
const {sendRpc} = require('./mq')
const {loggers: {logger: wdLogger}} = require('@welldone-software/node-toolbelt')
const {requestQueueName, responseQueueName} = require('./utils')

class MqClient {
  /**
   * Create a QueueRpc API Client
   * @param {*} stompitClient an instance of the `stompit`
   * @requires stompit
   * {@link http://gdaws.github.io/node-stomp/api/}
   */
  constructor(stompitClient, {logger = wdLogger} = {}) {
    this.baseQueueName = 'METHOD'
    this.stompit = stompitClient
    this.logger = logger.child({name: 'QueueRpcClient'})
  }

  /**
   * Listen to events emitted by the stompit client
   * @param {String} type type of the event
   * @param {Function} listener event handler
   */
  on(type, listener) {
    this.logger.debug('listening to event on stompit client', {type, listener})
    this.stompit.on(type, listener)
    return this
  }

  /**
   * Calls a method and awaits a response from the server
   * @param {String} method name of the method
   * @param {Object|*} params parameters to call the method with
   * @param {Object} options optional metadata, f.e headers and timeout
   */
  call(method, params, options = {}) {
    this.logger.debug({method, params, options}, 'calling method')
    return sendRpc(
      this.stompit,
      params,
      requestQueueName(this.baseQueueName, method),
      responseQueueName(this.baseQueueName, method),
      options
    )
  }

  /**
   * Peacefully disconnect the stompit connection
   */
  disconnect() {
    this.logger.info('disconnecting client')
    this.stompit.disconnect()
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
MqClient.connect = (config, options) =>
  new Promise((resolve, reject) =>
    stompit.connect(config, (error, stompitClient) => {
      if (error) {
        reject(error)
        return
      }
      resolve(new MqClient(stompitClient, options))
    }))

module.exports = MqClient
