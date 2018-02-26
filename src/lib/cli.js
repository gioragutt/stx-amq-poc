const Vorpal = require('vorpal')

const initializeCommand = (vorpal, {command: name, description, alias, autocomplete, action}) => {
  const command = vorpal.command(name, description)
  if (alias) {
    command.alias(alias)
  }
  if (autocomplete) {
    command.autocomplete(autocomplete)
  }
  command.option('-t, --timeout <timeout>').action((argsAndOptions, callback) => {
    const {options, ...args} = argsAndOptions
    Promise.resolve()
      .then(() => action(args, options))
      .then(callback)
      .catch(callback)
  })
}

/**
 * Creates an interactive command line with given commands and options
 * @param {{command: String, [description]: String, [alias]: String, action: Function}[]} commands
 * @param {{[delimiter]: String}} options
 */
const commandLine = (commands, {delimiter, onExit} = {}) => {
  const vorpal = Vorpal()
  global.vorpal = vorpal // allow debugging via console
  commands.forEach(desc => initializeCommand(vorpal, desc))
  vorpal.delimiter(delimiter || '$').show()
  if (onExit) {
    vorpal.on('vorpal_exit', onExit)
  }
}

module.exports = commandLine
