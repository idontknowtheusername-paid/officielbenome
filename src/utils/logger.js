/**
 * Logger Wrapper Conditionnel
 * Logs visibles seulement en développement (sauf erreurs)
 */

class Logger {
  constructor() {
    this.isDev = import.meta.env.DEV;
  }

  /**
   * Log normal - DEV seulement
   */
  log(...args) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  /**
   * Warning - DEV seulement
   */
  warn(...args) {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  /**
   * Error - TOUJOURS affiché
   */
  error(...args) {
    console.error(...args);
  }

  /**
   * Info - DEV seulement
   */
  info(...args) {
    if (this.isDev) {
      console.info(...args);
    }
  }

  /**
   * Debug - DEV seulement
   */
  debug(...args) {
    if (this.isDev) {
      console.debug(...args);
    }
  }

  /**
   * Table - DEV seulement
   */
  table(data) {
    if (this.isDev) {
      console.table(data);
    }
  }

  /**
   * Group - DEV seulement
   */
  group(label) {
    if (this.isDev) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDev) {
      console.groupEnd();
    }
  }

  /**
   * Time - DEV seulement (performance)
   */
  time(label) {
    if (this.isDev) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();
export default logger;
