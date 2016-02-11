const namespace = 'zodiase:ezlog/';
const logCollection = new Mongo.Collection(namespace + 'logs');

const indexes = {
  'createdAt': 1,
  'logger': 1,
  'component': 'text',
  'topics': 1,
};

const NOOP = function (result) {return result};

const verifyLogContent = function (content) {
  // Test if log content is serializable.
  try {
    let json = EJSON.stringify(content);
  } catch (error) {
    throw new Error('Log content must be serializable.');
  }
};
const makeArray = function (value) {
  let result = null;
  if (!Array.isArray(value)) {
    if (!value) {
      result = [];
    } else {
      result = [value];
    }
  } else {
    result = value;
  }
  return result;
};
const sliceArguments = function (_arguments) {
  let args = new Array(_arguments.length);
  for (let i = 0, n = _arguments.length; i < n; i++) {
    args[i] = _arguments[i];
  }
  return args;
};

const mirroredProperties = [
  'log',
  'onLog',
  'getLogById',
  'count',
  'getLatestLogs',
  'getEarliestLogs',
  'wipe',
  'publish',
  'subscribe'
];
const createMirror = function (source, target) {
  for (let propName of mirroredProperties) {
    target[propName] = source[propName];
  }
};

const abstractStaticMethodError = function(self, AbstractBase, methodName, signature) {
  let fullSignature = "" + methodName + "(" + signature + ")";
  if (self === AbstractBase) {
    throw new TypeError("Can not call static abstract method " + fullSignature+ ".");
  } else if (self[methodName] === AbstractBase[methodName]) {
    throw new TypeError("Please implement static abstract method " + fullSignature+ ".");
  } else {
    throw new TypeError("Do not call static abstract method " + fullSignature+ " from child.");
  }
};
const abstractConstructorError = function(self, AbstractBase, methodNames) {
  if (self.constructor === AbstractBase) {
    throw new TypeError("Can not construct abstract class.");
  }
  //else (called from child)
  for (let methodName of methodNames) {
    if (this[methodName] === AbstractBase.prototype[methodName]) {
      throw new TypeError("Please implement abstract method " + methodName + ".");
    }
  }
};
const abstractMethodError = function(methodName) {
  throw new TypeError("Do not call abstract method " + methodName + " from child.");
};

/**
 * Abstract logger class to be inherited.
 * @abstract
 * @class
 * @memberof EZLog
 */
class Base {

  /**
   * Anywhere.
   * Log the item.
   * @abstract
   * @param {...*} item - The item to be logged.
   * @return {String} The id of the log document.
   */
  static log(item) {
    abstractStaticMethodError(this, Base, 'log', 'item');
  }

  /**
   * Anywhere.
   * Register a function to be called when there is a new log.
   * @abstract
   * @param {Function} callback - The callback function.
   */
  static onLog(callback) {
    abstractStaticMethodError(this, Base, 'onLog', 'callback');
  }

  /**
   * Anywhere.
   * Find and return the log document specified by its id.
   * @abstract
   * @param {String} id - The id of the log document.
   * @return {LogDocument} The log document.
   */
  static getLogById(id) {
    abstractStaticMethodError(this, Base, 'getLogById', 'id');
  }

  /**
   * Anywhere.
   * Return the log count.
   * Note that the count on client side may not reflect the count on server side.
   * @abstract
   * @return {Integer} The log count.
   */
  static count () {
    abstractStaticMethodError(this, Base, 'count', '');
  }

  /**
   * Anywhere.
   * Find and return the latest log documents.
   * @abstract
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The latest log documents.
   */
  static getLatestLogs (count) {
    abstractStaticMethodError(this, Base, 'getLatestLogs', 'count');
  }

  /**
   * Anywhere.
   * Find and return the earliest log documents.
   * @abstract
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The earliest log documents.
   */
  static getEarliestLogs (count) {
    abstractStaticMethodError(this, Base, 'getEarliestLogs', 'count');
  }

  /**
   * Server.
   * Remove all existing logs.
   * This action creates a wipe log in the end.
   * This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.
   * @abstract
   * @return {Integer} The amount of log documents got removed.
   */
  static wipe () {
    abstractStaticMethodError(this, Base, 'wipe', '');
  }

  /**
   * Server.
   * Publish all the log documents of this logger.
   * The amount that got published is set by the subscribe function.
   * @abstract
   */
  static publish () {
    abstractStaticMethodError(this, Base, 'publish', '');
  }

  /**
   * Client.
   * Subscribe the latest log documents of this logger.
   * @abstract
   * @param {Integer} limit - The maximum amount of log documents to subscribe.
   * @return {Object} Same as Meteor.subscribe.
   */
  static subscribe (limit) {
    abstractStaticMethodError(this, Base, 'subscribe', 'limit');
  }

  /**
   * Create a logger.
   * @param {Object} [options] - Optional configurations.
   */
  constructor(options) {
    abstractConstructorError(this, Base, [
      //'log'
    ]);
  }

  /**
   * Anywhere.
   * Log the item.
   * @abstract
   * @param {...*} item - The item to be logged.
   * @return {String} The id of the log document.
   */
  log(item) {
    abstractMethodError('log');
  }

  /**
   * Anywhere.
   * Register a function to be called when there is a new log.
   * @abstract
   * @param {Function} callback - The callback function.
   */
  onLog(callback) {
    abstractMethodError('onLog');
  }

  /**
   * Anywhere.
   * Find and return the log document specified by its id.
   * @abstract
   * @param {String} id - The id of the log document.
   * @return {LogDocument} The log document.
   */
  getLogById(id) {
    abstractMethodError('getLogById');
  }

  /**
   * Anywhere.
   * Return the log count.
   * Note that the count on client side may not reflect the count on server side.
   * @abstract
   * @return {Integer} The log count.
   */
  count () {
    abstractMethodError('count');
  }

  /**
   * Anywhere.
   * Find and return the latest log documents.
   * @abstract
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The latest log documents.
   */
  getLatestLogs (count) {
    abstractMethodError('getLatestLogs');
  }

  /**
   * Anywhere.
   * Find and return the earliest log documents.
   * @abstract
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The earliest log documents.
   */
  getEarliestLogs (count) {
    abstractMethodError('getEarliestLogs');
  }

  /**
   * Server.
   * Remove all existing logs.
   * This action creates a wipe log in the end.
   * This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.
   * @abstract
   * @return {Integer} The amount of log documents got removed.
   */
  wipe () {
    abstractMethodError('wipe');
  }

  /**
   * Server.
   * Publish all the log documents of this logger.
   * The amount that got published is set by the subscribe function.
   * @abstract
   */
  publish () {
    abstractMethodError('publish');
  }

  /**
   * Client.
   * Subscribe the latest log documents of this logger.
   * @abstract
   * @param {Integer} limit - The maximum amount of log documents to subscribe.
   * @return {Object} Same as Meteor.subscribe.
   */
  subscribe (limit) {
    abstractMethodError('subscribe');
  }

}


/**
 * EZLog namespace.
 * @namespace
 */
EZLog = {
  "Base": Base

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Log the item.
   * @method log
   * @memberof EZLog
   * @param {...*} item - The item to be logged.
   * @return {String} The id of the log document.
   */

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Register a function to be called when there is a new log.
   * @method onLog
   * @memberof EZLog
   * @param {Function} callback - The callback function.
   */

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Find and return the log document specified by its id.
   * @method getLogById
   * @memberof EZLog
   * @param {String} id - The id of the log document.
   * @return {LogDocument} The log document.
   */

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Return the log count.
   * Note that the count on client side may not reflect the count on server side.
   * @method count
   * @memberof EZLog
   * @return {Integer} The log count.
   */

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Find and return the latest log documents.
   * @method getLatestLogs
   * @memberof EZLog
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The latest log documents.
   */

  /**
   * Anywhere.
   * Mirrored from EZLog.DefaultLogger.
   * Find and return the earliest log documents.
   * @method getEarliestLogs
   * @memberof EZLog
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The earliest log documents.
   */

  /**
   * Server.
   * Mirrored from EZLog.DefaultLogger.
   * Remove all existing logs.
   * This action creates a wipe log in the end.
   * This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.
   * @method wipe
   * @memberof EZLog
   * @return {Integer} The amount of log documents got removed.
   */

  /**
   * Server.
   * Mirrored from EZLog.DefaultLogger.
   * Publish all the log documents of this logger.
   * The amount that got published is set by the subscribe function.
   * @method publish
   * @memberof EZLog
   */

  /**
   * Client.
   * Mirrored from EZLog.DefaultLogger.
   * Subscribe the latest log documents of this logger.
   * @method subscribe
   * @memberof EZLog
   * @param {Integer} limit - The maximum amount of log documents to subscribe.
   * @return {Object} Same as Meteor.subscribe.
   */
};

helpers = {
  namespace,
  logCollection,
  indexes,
  NOOP,
  verifyLogContent,
  makeArray,
  sliceArguments,
  createMirror
};
