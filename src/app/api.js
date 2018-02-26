const {rpc} = require('./rpc')

const makeRpc = method => (args, options) => rpc(method, args, options)

const add = makeRpc('/add')
const remove = makeRpc('/remove')
const query = makeRpc('/query')
const clear = makeRpc('/clear')
const echo = makeRpc('/echo')

module.exports = {
  add,
  remove,
  query,
  clear,
  echo,
}
