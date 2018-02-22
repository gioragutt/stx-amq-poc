class RpcError extends Error {
  constructor(msg, context) {
    super(msg)
    this.context = context
  }
}

module.exports = RpcError
