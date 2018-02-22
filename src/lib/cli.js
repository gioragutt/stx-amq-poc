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
      .action(function action(args, callback) {
        const {options, ...restOfArgs} = args
        Promise.resolve()
          .then(() => command.action((...print) => this.log(...print), restOfArgs, options))
          .then(callback)
      })
  })

  vorpal
    .delimiter(delimiter || '$~>')
    .show()
}

module.exports = commandLine
