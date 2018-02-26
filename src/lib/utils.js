const {kebabCase, camelCase} = require('lodash')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const connectionString = require('connection-string')

const requestQueueName = method => `request/${method}`
const responseQueueName = (method, id) => `response/${id}/${method}`

const encodeContent = (content, contentType) => {
  logger.debug({content, contentType}, 'encoding')
  return typeof content === 'object' || contentType === 'application/json' ? JSON.stringify(content) : content
}

const decodeContent = (content, contentType) => {
  logger.debug({content, contentType}, 'decoding')
  return contentType === 'application/json' ? JSON.parse(content) : content
}

const makeHeaderParser = keyMapper => headers =>
  Object.keys(headers).reduce((acc, key) => {
    acc[keyMapper(key)] = headers[key]
    return acc
  }, {})

const toStompHeaders = makeHeaderParser(kebabCase)
const fromStompHeaders = makeHeaderParser(camelCase)

const stripSlash = method => (method[0] === '/' ? method.substr(1) : method)

const parseConnectionString = (path) => {
  const {
    hostname: host,
    port = 61613,
    user: login,
    password: passcode,
  } = connectionString(path)
  return {host, port, connectHeaders: {login, passcode}}
}

module.exports = {
  requestQueueName,
  responseQueueName,
  encodeContent,
  decodeContent,
  toStompHeaders,
  fromStompHeaders,
  stripSlash,
  parseConnectionString,
}
