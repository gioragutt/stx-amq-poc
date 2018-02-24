const Vorpal = require('vorpal')

/**
 * Creates an interactive command line with given commands and options
 * @param {{command: String, [description]: String, [alias]: String, action: Function}[]} commands
 * @param {{[delimiter]: String}} options
 */
const commandLine = (commands, {delimiter} = {}) => {
  const vorpal = Vorpal()
  commands.forEach((command) => {
    vorpal
      .command(command.command, command.description)
      .alias(command.alias)
      .option('-t, --timeout <timeout>')
      .action((argsAndOptions, callback) => {
        const {options, ...args} = argsAndOptions
        Promise.resolve()
          .then(() => command.action(args, options))
          .then(callback)
      })
  })

  vorpal
    .delimiter(delimiter || '$~>')
    .show()
}

module.exports = commandLine
