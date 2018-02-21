const {configs: {mapEnv}} = require('@welldone-software/node-toolbelt')

module.exports = mapEnv({
  activeMqHost: '',
  activeMqPort: 61614,
  activeMqUsername: undefined,
  activeMqPassword: undefined,
  requestQueue: 'Request',
  responseQueue: 'Response',
  message: 'echo test',
  timeout: 3000,
})
