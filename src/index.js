require('app-module-path').addPath(__dirname)

const stompit = require('stompit')
const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const {activeMqPath} = require('./config')

const connectOptions = {
  host: 'localhost',
  port: 61613,
  connectHeaders: {
    host: '/',
    login: 'username',
    passcode: 'password',
    'heart-beat': '5000,5000',
  },
}

stompit.connect(activeMqPath, (connectionError, client) => {
  if (connectionError) {
    logger.error(connectionError.message, 'connection error')
    return
  }

  const sendHeaders = {
    destination: '/queue/test',
    'content-type': 'text/plain',
  }

  const frame = client.send(sendHeaders)
  frame.write('hello')
  frame.end()

  const subscribeHeaders = {
    destination: '/queue/test',
    ack: 'client-individual',
  }

  client.subscribe(subscribeHeaders, (subscriptionError, message) => {
    if (subscriptionError) {
      console.log(`subscribe error ${subscriptionError.message}`)
      return
    }

    message.readString('utf-8', (error, body) => {
      if (error) {
        console.log(`read message error ${error.message}`)
        return
      }

      console.log(`received message: ${body}`)

      client.ack(message)

      client.disconnect()
    })
  })
})
