const RpcError = require('./exceptions')
const {upperCase} = require('lodash')

class QueueRpcRouter {
  constructor() {
    this.methodHandlers = {}
  }

  /**
   * Adds a handler to a given method
   * @param {String} name name of the method
   * @param {Function} handler callback to handle the request. May be sync or async
   */
  method(name, handler) {
    if (typeof handler !== 'function') {
      const type = Object.prototype.toString.call(handler)
      throw new RpcError(`QueueRpcRouter.method() requires a callback but got a ${type}`)
    }

    name = upperCase(name)
    if (this.methodHandlers[name]) {
      throw new RpcError('handler for method already defined', {method: name})
    }

    this.methodHandlers[name] = handler
  }
}

module.exports = QueueRpcRouter
