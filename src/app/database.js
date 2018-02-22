const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const RpcError = require('lib/exceptions')

const tryParseNumber = (number, method) => {
  // eslint-disable-next-line no-restricted-globals
  if (!number || isNaN(number)) {
    throw new RpcError(`Invalid number sent to ${method}`, {number})
  }

  return Number.parseFloat(number)
}

class Database {
  constructor() {
    this.list = new Set()
  }

  add(number) {
    number = tryParseNumber(number, 'ADD')
    if (this.list.has(number)) {
      logger.debug(`${number} already in the list`)
    } else {
      logger.info(`Adding ${number} to the list`)
      this.list.add(number)
    }
  }

  remove(number) {
    number = tryParseNumber(number, 'REMOVE')
    if (!this.list.has(number)) {
      logger.debug(`${number} not in the list`)
    } else {
      logger.info(`Removing ${number} from the list`)
      this.list.delete(number)
    }
  }

  query() {
    const result = Array.from(this.list)
    logger.debug({result}, 'query result')
    return result
  }

  clear() {
    logger.info('clearing the list')
    this.list.clear()
  }
}

module.exports = Database
