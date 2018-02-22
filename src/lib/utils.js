const {upperCase, kebabCase, camelCase} = require('lodash')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')

const queueName = type => (baseQueueName, method) =>
  [baseQueueName, method, type].map(upperCase).join('.')

const requestQueueName = queueName('request')
const responseQueueName = queueName('response')

const encodeContent = (content, contentType) => {
  logger.debug({content, contentType}, 'encoding')
  return (typeof content === 'object' || contentType === 'application/json'
    ? JSON.stringify(content) : content)
}

const decodeContent = (content, contentType) => {
  logger.debug({content, contentType}, 'decoding')
  return (contentType === 'application/json' ? JSON.parse(content) : content)
}

const makeHeaderParser = keyMapper => headers => Object.keys(headers)
  .reduce((acc, key) => {
    acc[keyMapper(key)] = headers[key]
    return acc
  }, {})

const toStompHeaders = makeHeaderParser(kebabCase)
const fromStompHeaders = makeHeaderParser(camelCase)

module.exports = {
  requestQueueName,
  responseQueueName,
  encodeContent,
  decodeContent,
  toStompHeaders,
  fromStompHeaders,
}
