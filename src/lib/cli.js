const Vorpal = require('vorpal')

/**
 * Creates an interactive command line with given commands and options
 * @param {{command: String, [description]: String, [alias]: String, action: Function}[]} commands
 * @param {{[delimiter]: String}} options
 */
const commandLine = (commands, {delimiter} = {}) => {
  const vorpal = Vorpal()
  commands.forEach((desc) => {
    const command = vorpal.command(desc.command, desc.description)
    if (desc.alias) {
      command.alias(desc.alias)
    }
    if (desc.autocomplete) {
      command.autocomplete(desc.autocomplete)
    }
    command
      .option('-t, --timeout <timeout>')
      .action((argsAndOptions, callback) => {
        const {options, ...args} = argsAndOptions
        Promise.resolve()
          .then(() => desc.action(args, options))
          .then(callback)
      })
  })

  const delimiterContent = () => `[${(new Date()).toLocaleString()}] ${delimiter || '$~>'} `
  vorpal
    .delimiter(delimiterContent())
    .show()

  setInterval(() => vorpal.ui.delimiter(delimiterContent()), 1000)
}

module.exports = commandLine
