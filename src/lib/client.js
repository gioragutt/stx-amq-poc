const stompit = require('stompit')
const {sendRpc} = require('./mq')
const {requestQueueName, responseQueueName} = require('./utils')

class QueueRpcClient {
  constructor(stompitClient) {
    this.baseQueueName = 'METHOD'
    this.stompit = stompitClient
  }

  on(type, listener) {
    this.stompit.on(type, listener)
    return this
  }

  callMethod(method, params, options = {}) {
    return sendRpc(
      this.stompit,
      params,
      requestQueueName(this.baseQueueName, method),
      responseQueueName(this.baseQueueName, method),
      options
    )
  }

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
