const { createLogger, addColors, format, transports } = require('winston')
const { serializeError } = require('serialize-error')

const defaultLevels = {
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
  },
  colors: {}
}

const printfLog = (info) => {

  const error = info.error ? serializeError(info.error) : undefined

  return JSON.stringify(Object.assign(
    {
      timestamp: info.timestamp,
      level: info.level,
      source: info.source,
      component: info.component,
      message: info.message
    },
    info,
    { error }
  ))

}

const defaultFormat = format.combine(format.timestamp(), format.printf(printfLog))
const defaultTransport = new transports.Console({ format: defaultFormat })

const generateLogger = (transport, opts) => {

  transport = transport || defaultTransport
  opts = Object.assign({ level: 'info', meta: {}, logLevels: defaultLevels }, opts || {})

  const logger = createLogger({
    level: opts.level,
    levels: opts.logLevels.levels,
    defaultMeta: opts.meta,
    transports: [ transport ],
    exitOnError: false
  })

  addColors(defaultLevels.colors)

  transport.on('logged', (...args) => logger.emit('log', ...args))

  logger.exceptions.handle(transport)

  return logger

}

module.exports = { generateLogger, defaultTransport }
