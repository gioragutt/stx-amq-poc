const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const uuid = require('uuid')

const defaultHeaders = {
  'content-type': 'application/json',
}

/**
 * Sends a message and awaits a response
 * @param {*} client stompit client instance
 * @param {(Object|string|*)} message message to send. Should be a JS object or JSON string by default,
 *  otherwise a different content-type should be specified in the headers
 * @param {string} destinationQueue queue to which the message will be sent to
 * @param {string} responseQueue queue to which the response to the message will be sent
 * @param {Object} headers additional message headers
 */
const sendMessageAndAwaitResponse = (client, message, destinationQueue, responseQueue, headers = {}) =>
  new Promise((resolve, reject) => {
    const correlationId = uuid()
    const sendHeaders = {
      ...defaultHeaders,
      ...headers,
      destination: destinationQueue,
      'reply-to': responseQueue,
      'correlation-id': correlationId,
    }

    const messageToSend = typeof message === 'object' ? JSON.stringify(message) : message
    client
      .send(sendHeaders)
      .write(messageToSend)
      .end()

    client.subscribe({destination: responseQueue}, (err, response) => {
      if (err) {
        logger.error(err, 'subscription error?')
        reject(err)
        return
      }

      logger.info(response, 'received response')
      resolve(response)
    })
  })

module.exports = sendMessageAndAwaitResponse
