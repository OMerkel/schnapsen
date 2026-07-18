/**
 * EventBus implements observer pattern for decoupled communication
 *
 * @class EventBus
 * Used by game logic to notify UI of state changes without direct coupling
 */

export class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to event
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribe from event
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback,
    );
  }

  /**
   * Emit event to all subscribers
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    for (const callback of this.listeners[event]) {
      callback(data);
    }
  }

  /**
   * Subscribe once and auto-unsubscribe
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    const wrapped = (data) => {
      callback(data);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  }
}
