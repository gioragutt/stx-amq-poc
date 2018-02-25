const uuid = require('uuid')
const {encodeContent, decodeContent, toStompHeaders, fromStompHeaders} = require('./utils')

const parseMessage = message =>
  new Promise((resolve, reject) =>
    message.readString('utf-8', (messageParseError, body) => {
      if (messageParseError) {
        reject(messageParseError)
        return
      }
      resolve(decodeContent(body, fromStompHeaders(message.headers).contentType))
    }))

const defaultHeaders = {
  contentType: 'application/json',
}

const sendFrame = (client, headers, message) => {
  const stompHeaders = toStompHeaders(headers)
  const frame = client.send(stompHeaders)
  frame.write(encodeContent(message, headers.contentType))
  frame.end()
}

const awaitRpcResponse = (resolve, reject, client, destination) => {
  const subscription = client.subscribe({destination}, (subscriptionError, message) => {
    if (subscriptionError) {
      reject(subscriptionError)
      return
    }

    subscription.unsubscribe()
    message.readString('utf-8', (messageError, responseContent) => {
      if (messageError) {
        reject(messageError)
        return
      }

      const headers = fromStompHeaders(message.headers)
      const body = decodeContent(responseContent, headers.contentType)
      const response = {headers, body}
      if (headers.ok === 'false') {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
  return subscription
}

const setRequestTimeout = (reject, timeout, subscription) => {
  if (timeout > 0) {
    setTimeout(() => {
      subscription.unsubscribe()
      reject(new Error(`RPC request timed out after ${timeout} ms`))
    }, timeout)
  }
}

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
const sendRpc = (client, content, destinationQueue, responseQueue, {headers = {}, timeout = 0} = {}) =>
  new Promise((resolve, reject) => {
    const correlationId = uuid()
    const sendHeaders = {
      ...defaultHeaders,
      ...headers,
      destination: destinationQueue,
      replyTo: responseQueue,
      correlationId,
    }

    sendFrame(client, sendHeaders, content)

    const subscription = awaitRpcResponse(resolve, reject, client, responseQueue)
    setRequestTimeout(reject, timeout, subscription)
  })

const responseHeaders = (requestHeaders) => {
  const {'reply-to': destination, ...rest} = requestHeaders
  return {...rest, destination}
}

/**
 * Responds to a RPC made via `sendRpc`
 * @param {*} client stompit client instance
 * @param {stream.Readable} message message from queue
 * @returns {Promise<{headers: Object, body: *}>} the response sent, comprised of the headers and the body
 */
const respondToRpc = (client, message, handler, body) =>
  new Promise((resolve, reject) => {
    const headers = fromStompHeaders(responseHeaders(message.headers))
    Promise.resolve()
      .then(() => handler({body, headers}))
      .then((result) => {
        result = result || 'success'
        const successHeaders = {...headers, ok: true}
        sendFrame(client, successHeaders, result)
        resolve({headers: successHeaders, result})
      })
      .catch((handlerError) => {
        const {message: errorMessage, context} = handlerError
        const failureHeaders = {...headers, ok: false}
        sendFrame(client, failureHeaders, {message: errorMessage, context})
        reject(handlerError)
      })
  })

module.exports = {
  parseMessage,
  sendRpc,
  respondToRpc,
}
