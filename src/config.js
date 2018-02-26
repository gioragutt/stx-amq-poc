const {configs: {mapEnv}} = require('@welldone-software/node-toolbelt')

module.exports = mapEnv({
  activeMqPath: '',
  activeMqHost: '',
  activeMqPort: 61614,
  activeMqUsername: undefined,
  activeMqPassword: undefined,
  logLevel: 'info',
})
