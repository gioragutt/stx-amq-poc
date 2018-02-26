const RpcError = require('./exceptions')
const {stripSlash} = require('./utils')

class Router {
  constructor() {
    this.methodHandlers = {}
  }

  /**
   * Adds a handler to respond to an RPC
   * @param {String} method name of the method
   * @param {Function} handler callback to handle the request. May be sync or async
   */
  respondTo(method, handler) {
    method = stripSlash(method)
    if (typeof handler !== 'function') {
      const type = Object.prototype.toString.call(handler)
      throw new RpcError(`QueueRpcRouter.method() requires a callback but got a ${type}`)
    }

    if (this.methodHandlers[method]) {
      throw new RpcError(`handler for method ${method} already defined`)
    }

    this.methodHandlers[method] = handler
  }
}

module.exports = Router
