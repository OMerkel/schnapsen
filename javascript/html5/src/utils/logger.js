/**
 * Logger provides structured logging across the application
 *
 * @class Logger
 * Supports debug, info, warn, error levels
 */

export class Logger {
  constructor(namespace = "Schnapsen") {
    this.namespace = namespace;
  }

  /**
   * Log at debug level
   * @param {string} message
   * @param {*} data
   */
  debug(message, data) {
    console.debug(`[${this.namespace}] ${message}`, data);
  }

  /**
   * Log at info level
   * @param {string} message
   * @param {*} data
   */
  info(message, data) {
    console.info(`[${this.namespace}] ${message}`, data);
  }

  /**
   * Log at warn level
   * @param {string} message
   * @param {*} data
   */
  warn(message, data) {
    console.warn(`[${this.namespace}] ${message}`, data);
  }

  /**
   * Log at error level
   * @param {string} message
   * @param {*} data
   */
  error(message, data) {
    console.error(`[${this.namespace}] ${message}`, data);
  }
}
