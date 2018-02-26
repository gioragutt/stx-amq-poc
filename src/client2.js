require('app-module-path').addPath(__dirname)

const cli = require('lib/cli')
const api = require('app/api')
const {logger} = require('app/rpc')

const callMethod = (method, argsMapper = a => a) => (args, options) =>
  method(argsMapper(args) || {}, options)
    .then(({body}) => logger.info(body))
    .catch(e => logger.error(e))

const commands = [
  {
    command: 'add <number>',
    description: 'Add a number to the list',
    alias: 'a',
    action: callMethod(api.add),
  },
  {
    command: 'remove <number>',
    description: 'Removes a number from the list',
    alias: 'rm',
    action: callMethod(api.remove),
  },
  {
    command: 'query',
    description: 'Shows the list',
    alias: 'ls',
    action: callMethod(api.query),
  },
  {
    command: 'clear',
    description: 'Clears the list',
    alias: 'c',
    action: callMethod(api.clear),
  },
  {
    command: 'echo <message...>',
    action: callMethod(api.echo, ({message, ...rest}) => ({message: message.join(' '), ...rest})),
  },
]

cli(commands, {delimiter: 'ActiveMq $'})
