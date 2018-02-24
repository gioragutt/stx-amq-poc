const stompit = require('stompit')
const {sendRpc} = require('./mq')
const {requestQueueName, responseQueueName} = require('./utils')

class QueueRpcClient {
  /**
   * Create a QueueRpc API Client
   * @param {*} stompitClient an instance of the `stompit`
   * @requires stompit
   */
  constructor(stompitClient) {
    this.baseQueueName = 'METHOD'
    this.stompit = stompitClient
  }

  /**
   * Listen to events emitted by the stompit client
   * @param {String} type type of the event
   * @param {Function} listener event handler
   */
  on(type, listener) {
    this.stompit.on(type, listener)
    return this
  }

  /**
   * Calls a method and awaits a response from the server
   * @param {String} method name of the method
   * @param {Object|*} params parameters to call the method with
   * @param {Object} options optional metadata, f.e headers and timeout
   */
  callMethod(method, params, options = {}) {
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
    this.stompit.disconnect()
  }
}

QueueRpcClient.connect = config => new Promise((resolve, reject) =>
  stompit.connect(config, (error, stompitClient) => {
    if (error) {
      reject(error)
      return
    }
    resolve(new QueueRpcClient(stompitClient))
  }))

module.exports = QueueRpcClient
