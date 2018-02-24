const {loggers: {logger}} = require('@welldone-software/node-toolbelt')
const RpcError = require('lib/exceptions')

const tryParseNumber = (number, method) => {
  // eslint-disable-next-line no-restricted-globals
  if ((!number && number !== 0) || isNaN(number)) {
    throw new RpcError(`Invalid number sent to ${method}`, {number})
  }

  return Number.parseFloat(number)
}

class Database {
  constructor() {
    this.list = new Set()
  }

  get items() {
    return `[${Array.from(this.list).join(', ')}]`
  }

  add(number) {
    number = tryParseNumber(number, 'ADD')
    if (this.list.has(number)) {
      logger.debug(`${number} already in the list`)
      return `${number} already in the list`
    }

    logger.info(`Adding ${number} to the list`)
    this.list.add(number)
    return this.items
  }

  remove(number) {
    number = tryParseNumber(number, 'REMOVE')
    if (!this.list.has(number)) {
      logger.debug(`${number} not in the list`)
      return this.items
    }

    logger.info(`Removing ${number} from the list`)
    this.list.delete(number)
    return this.items
  }

  query() {
    const result = this.items
    logger.debug({result}, 'query result')
    return result
  }

  clear() {
    logger.info('Clearing the list')
    this.list.clear()
    return this.items
  }
}

module.exports = Database
