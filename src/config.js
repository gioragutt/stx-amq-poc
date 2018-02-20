const {configs: {mapEnv}} = require('@welldone-software/node-toolbelt')

module.exports = mapEnv({
  activeMqHost: '',
  activeMqPort: 61614,
  activeMqUsername: '',
  activeMqPassword: '',
  requestQueue: 'Request',
  responseQueue: 'Response',
})
