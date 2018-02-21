const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const uuid = require('uuid')

const defaultHeaders = {
  'content-type': 'application/json',
}

const sendFrame = (client, headers, message) => {
  const frame = client.send(headers)
  frame.write(message)
  frame.end()
}

const encodeContent = content =>
  (typeof content === 'object' ? JSON.stringify(content) : content)
const decodeContent = (content, contentType) =>
  (contentType === 'application/json' ? JSON.parse(content) : content)

/**
 * Sends a message and awaits a response
 * @param {*} client stompit client instance
 * @param {(Object|string|*)} content message to send.
 *  should be a JS object or JSON string by default,
 *  otherwise a different `content-type` should be specified in the headers
 * @param {string} destinationQueue queue to which the message will be sent to
 * @param {string} responseQueue queue to which the response to the message will be sent
 * @param {{headers: Object, timeout: number}} [options] options to customize the request
 *  headers:
 *    custom headers to send with the request.
 *    headers will always contain the `content-type` header, which is `aplication-json` by default
 *
 *  timeout:
 *    if specified above 0, will time out after `timeout` milliseconds if a response is not received
 * @returns {Promise<{headers: Object, body: *}>} the response received, comprised of the headers and the body
 */
const sendRpc = (client, content, destinationQueue, responseQueue, {headers = {}, timeout = -1} = {}) =>
  new Promise((resolve, reject) => {
    const correlationId = uuid()
    const sendHeaders = {
      ...defaultHeaders,
      ...headers,
      destination: destinationQueue,
      'reply-to': responseQueue,
      'correlation-id': correlationId,
    }

    const messageToSend = encodeContent(content)
    sendFrame(client, sendHeaders, messageToSend)

    if (timeout > 0) {
      setTimeout(() => reject(new Error(`RPC request timed out after ${timeout} ms`)), timeout)
    }

    client.subscribe({destination: responseQueue}, (subscriptionError, message) => {
      if (subscriptionError) {
        logger.error(subscriptionError, 'subscription error?')
        reject(subscriptionError)
        return
      }

      message.readString('utf-8', (messageError, responseContent) => {
        if (messageError) {
          logger.error(messageError, 'message read error?')
          reject(messageError)
          return
        }

        const body = decodeContent(responseContent, message.headers['content-type'])
        const response = {headers: message.headers, body}
        resolve(response)
      })
    })
  })

const extractResponseHeaders = (requestHeaders) => {
  const {
    'reply-to': destination,
    'correlation-id': correlationId,
    'content-type': contentType,
  } = requestHeaders

  const headers = {
    destination,
    'correlation-id': correlationId,
    'content-type': contentType,
  }

  return headers
}

/**
 * Responds to a RPC made via `sendRpc`
 * @param {*} client stompit client instance
 * @param {stream.Readable} message message from queue
 * @returns {Promise<{headers: Object, body: *}>} the response sent, comprised of the headers and the body
 */
const respondToRpc = (client, message) => new Promise((resolve, reject) =>
  message.readString('utf-8', (error, body) => {
    if (error) {
      reject(error)
      return
    }

    const headers = extractResponseHeaders(message.headers)

    sendFrame(client, headers, body)
    resolve({headers, body})
  }))

module.exports = {
  sendRpc,
  sendFrame,
  respondToRpc,
}
