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

/**
 * @class
 */
class EZLogger {

  /**
   * Helper function for generating pub/sub names.
   * @private
   * @param {EZLogger} logger - The targeted logger instance.
   * @return {String} The pub/sub name.
   */
  static _getPublishName (logger) {
    return namespace + self._CONSTS.LoggerId + '/' + logger.signature;
  }

  /**
   * Helper function for checking if the logger is an instance of this class or is the singleton.
   * @private
   * @param {EZLogger} logger - The targeted logger instance.
   * @throws {Error} `logger` must be an instance of this class or is the singleton.
   */
  static _identityCheck (logger) {
    if (!(logger instanceof self || logger === self)) {
      throw new Error('Illegal invocation');
    }
  }

  /**
   * Helper function for generating filter patterns for topics.
   * @private
   * @param {EZLogger} logger - The targeted logger instance.
   * @return {Array.<String>|{$exists: true}} The filter pattern.
   */
  static _getTopicsFilter (logger) {
    return (logger.topics.length > 0) ? logger.topics : self._CONSTS.ExistsFilter;
  }

  /**
   * Trigger callbacks of this logger for this event.
   * @private
   * @param {EZLogger} logger
   * @param {String} eventName
   * @param {Array.<*>} data
   */
  static _triggerCallbacks (logger, eventName, data) {
    self._identityCheck(logger);
    check(eventName, String, "Event name should be a String.");
    check(data, Array, "Data should be an Array of items.");

    // @type {Object.<String, Array.<Function>>}
    let callbacks = self._DATA.callbacks[eventName];
    if (!callbacks) return;
    // @type {Array.<Function>}
    let loggerCBs = callbacks[logger.signature];
    if (!loggerCBs) return;
    for (let cb of loggerCBs) {
      cb.apply(logger, data);
    }
  }

  /**
   * Register a callback to this logger for this event.
   * @private
   * @param {EZLogger} logger
   * @param {String} eventName
   * @param {Function} callback
   */
  static _registerCallback (logger, eventName, callback) {
    self._identityCheck(logger);
    check(eventName, String, "Event name should be a String.");
    check(callback, Function, "Callback should be a function.");

    // @type {Object.<String, Object.<String, Array.<Function>>>}
    let allCBs = self._DATA.callbacks;
    // @type {Object.<String, Array.<Function>>}
    let callbacks = allCBs[eventName] = allCBs[eventName] || {};
    // @type {Array.<Function>}
    let loggerCBs = callbacks[logger.signature] = callbacks[logger.signature] || [];
    // Do not register the same callback twice.
    if (loggerCBs.indexOf(callback) > -1) {
      // Throw error?
    } else {
      loggerCBs.push(callback);
    }

    // Spawn observer for async callbacks.
    // @type {Object.<String, Object.<String, Observer>>}
    let allOBs = self._DATA.observers;
    // @type {Object.<String, Observer>}
    let observers = allOBs[eventName] = allOBs[eventName] || {};

    if (!observers[logger.signature]) {
      // Setup observer.
      // New logs on the same platform would have already triggered onLog callbacks.
      // Observer is only used for logs created at the other platform.
      let cursor = logCollection.find({
        'platform': Number(!Meteor.isClient),
        'logger': self._CONSTS.LoggerId,
        'component': logger.component,
        'topics': self._getTopicsFilter(logger)
      }, {
        'fields': self._CONSTS.ReturnIdOnly
      });
      let observer = cursor.observeChanges({
        'added': function (eventName, id, fields) {
          let logger = this;

          let allOBs = self._DATA.observers;
          let observers = allOBs[eventName] = allOBs[eventName] || {};

          // This callback may be called multiple times for the initial find results. Do nothing.
          if (!observers[logger.signature]) return;

          if (Meteor.isClient) {
            // Multiple logs may pop up due to subscribing. If the subscription is not ready, these logs are not new.
            let subscriptions = self._DATA.subscriptions;
            if (!subscriptions[logger.signature].ready()) return;
          }

          let newLog = logger.getLogById(id);
          // Trigger onLog handlers synchronously.
          self._triggerCallbacks(logger, self._CONSTS.EventNames.OnLog, [id, newLog]);
        }.bind(logger, eventName)
      });
      observers[logger.signature] = observer;
    }
  }

  /**
   * Work in Progress.
   * @private
   */
  static _dumpEarliestLogs (logger, count) {
    let logItems = self._getEarliestLogs(logger, count);
    let logIds = logItems.map(function (item, index) {
      return item._id;
    });
    logCollection.remove({
      '_id': {
        '$in': logIds
      }
    });
    return logItems;
  }

  /**
   * Create an EZLogger instance.
   * @constructs EZLogger
   * @param {Object} [options] - Optional configurations.
   * @param {String} [options.component] - The name of the component this logger is for. The value is case-insensitive. Default is `"default"`.
   * @param {Array.<String>} [options.topics] - A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`.
   */
  constructor(options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    this.component = String(options.component).toLowerCase() || 'default';
    // Make topics a sorted array of lowercase Strings.
    this.topics = makeArray(options.topics).map((x) => String(x).toLowerCase()).sort((a, b) => a > b);

    // Generate a signature for this logger. Multiple loggers may share the same signature.
    this.signature = EJSON.stringify([this.component, this.topics]);

    // Callbacks are shared with loggers with the same signature.
  }

  /**
   * Anywhere.
   * Log the item.
   * @param {...*} item - The item to be logged.
   * @return {String} The id of the log document.
   */
  log(item) {
    let createdAt = Date.now();
    self._identityCheck(this);

    let content = sliceArguments(arguments);

    verifyLogContent(content);
    check(this.component, String, "Logger has invalid component name.");
    check(this.topics, [String], "Logger has invalid topics.");

    let timeCollision = Number(self._DATA.lastLog.createdAt) === Number(createdAt);
    let createdOrder = timeCollision ? (self._DATA.lastLog._createdOrder + 1) : 0;

    let newLog = {
      'createdAt': createdAt,
      '_createdOrder': createdOrder,
      // 1 means client, 0 means server.
      'platform': Number(Meteor.isClient),
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': this.topics,
      'content': content
    }

    let newlogId = logCollection.insert(newLog);

    // Update last log bookkeeping.
    self._DATA.lastLog._id = newlogId;
    self._DATA.lastLog.createdAt = createdAt;
    self._DATA.lastLog._createdOrder = createdOrder;

    // Fetch the new log from collection.
    newLog = this.getLogById(newlogId);

    // Trigger onLog handlers synchronously.
    self._triggerCallbacks(this, self._CONSTS.EventNames.OnLog, [newlogId, newLog]);

    return newlogId;
  }

  /**
   * Anywhere.
   * Register a function to be called when there is a new log.
   * @param {Function} callback - The callback function.
   */
  onLog(callback) {
    self._identityCheck(this);
    check(callback, Function, 'Callback is not a function.');

    self._registerCallback(this, self._CONSTS.EventNames.OnLog, callback);
  }

  /**
   * Anywhere.
   * Find and return the log document specified by its id.
   * @param {String} id - The id of the log document.
   * @return {LogDocument} The log document.
   */
  getLogById(id) {
    self._identityCheck(this);
    check(id, String, 'Expect id to be a string.');
    let log = logCollection.findOne({
      '_id': id,
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': self._getTopicsFilter(this)
    }, {
      'fields': self._CONSTS.ReturnLogFields
    });
    return log;
  }

  /**
   * Anywhere.
   * Return the log count.
   * Note that the count on client side may not reflect the count on server side.
   * @return {Integer} The log count.
   */
  count () {
    self._identityCheck(this);
    //else
    let cursor = logCollection.find({
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': self._getTopicsFilter(this)
    }, {
      'fields': self._CONSTS.ReturnIdOnly
    });
    return cursor.count();
  }

  /**
   * Anywhere.
   * Find and return the latest log documents.
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The latest log documents.
   */
  getLatestLogs (count) {
    self._identityCheck(this);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': self._getTopicsFilter(this)
    }, {
      'sort': self._CONSTS.ReturnLogSort,
      'limit': count,
      'fields': self._CONSTS.ReturnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  /**
   * Anywhere.
   * Find and return the earliest log documents.
   * @param {Integer} count - The amount of log documents to return. The actual returned amount may be less.
   * @return {Array.<LogDocument>} The earliest log documents.
   */
  getEarliestLogs (count) {
    self._identityCheck(this);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': self._getTopicsFilter(this)
    }, {
      'sort': self._CONSTS.ReturnLogSortReversed,
      'limit': count,
      'fields': self._CONSTS.ReturnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  /**
   * Server.
   * Remove all existing logs.
   * This action creates a wipe log in the end.
   * This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.
   * @return {Integer} The amount of log documents got removed.
   */
  wipe () {
    self._identityCheck(this);
    let removeCount = logCollection.remove({
      'logger': self._CONSTS.LoggerId,
      'component': this.component,
      'topics': self._getTopicsFilter(this)
    });
    // Log wipe.
    this.log('Logs Wiped.');
    return removeCount;
  }

  /**
   * Server.
   * Publish all the log documents of this logger.
   * The amount that got published is set by the subscribe function.
   */
  publish () {
    self._identityCheck(this);
    let publishName = self._getPublishName(this);
    Meteor.publish(publishName, function (limit) {
      check(limit, Match.Integer);
      let cursor = logCollection.find({
        'logger': self._CONSTS.LoggerId,
        'component': this.component,
        'topics': self._getTopicsFilter(this)
      }, {
        'sort': self._CONSTS.ReturnLogSort,
        'limit': limit,
        'fields': self._CONSTS.PublishLogFields
      });
      return cursor;
    }.bind(this));
  }

  /**
   * Client.
   * Subscribe the latest log documents of this logger.
   * @param {Integer} limit - The maximum amount of log documents to subscribe.
   * @return {Object} Same as Meteor.subscribe.
   */
  subscribe (limit) {
    self._identityCheck(this);

    let subscriptions = self._DATA.subscriptions;
    if (subscriptions[this.signature]) {
      subscriptions[this.signature].stop();
      delete subscriptions[this.signature];
    }

    let publishName = self._getPublishName(this);
    subscriptions[this.signature] = Meteor.subscribe(publishName, limit);
    return subscriptions[this.signature];
  }
}
const self = EZLogger;

/**
 * Gather all constants here for easy management.
 * @private
 */
self._CONSTS = {
  /**
   * A unique identifier of this logger class.
   */
  "LoggerId": 'default',
  "ReturnLogSort": [
    ['createdAt', 'desc'],
    ['_createdOrder', 'desc']
  ],
  "ReturnLogSortReversed": [
    ['createdAt', 'asc'],
    ['_createdOrder', 'asc']
  ],
  /**
   * The fields to return when getting logs.
   */
  "ReturnLogFields": {
    "createdAt": 1,
    "platform": 1,
    "logger": 1,
    "component": 1,
    "topics": 1,
    "content": 1
  },
  /**
   * The fields to return when publishing logs.
   */
  "PublishLogFields": {
    "createdAt": 1,
    // Client has to know this for sorting to work.
    "_createdOrder": 1,
    "platform": 1,
    "logger": 1,
    "component": 1,
    "topics": 1,
    "content": 1
  },
  "ReturnIdOnly": {
    "_id": 1
  },
  "DefaultComponent": 'default',
  "DefaultTopics": [],
  "ExistsFilter": {
    "$exists": true
  },
  "EventNames": {
    "OnLog": 'onLog'
  }
};

/**
 * This object stores data used in runtime.
 * @private
 */
self._DATA = {
  /**
   * Stores callbacks shared across instances.
   * @type {Object.<String, Object.<String, Array.<Function>>>}
   */
  "callbacks": {},
  /**
   * Stores observers for async callbacks.
   * @type {Object.<String, Object.<String, Observer>>}
   */
  "observers": {},
  /**
   * Keeps track of subscriptions. Only needed on client side.
   * @type {Object.<String, Subscription>}
   */
  "subscriptions": {},
  /**
   * Keeps track of the last log.
   * @type {{
   *   _id: String,
   *   createdAt: Date,
   *   _createdOrder: Integer
   * }}
   */
  "lastLog": {
    '_id': '',
    'createdAt': null,
    // In case two logs have the same log time, increment this field to
    // distinguish the order of creation.
    '_createdOrder': 0
  }
};

// Remove unsupported functions on each platform.
if (Meteor.isClient) {
  self.prototype.publish = NOOP.bind(null, null);
  self.prototype.wipe = NOOP.bind(null, 0);
}
if (Meteor.isServer) {
  self.prototype.subscribe = NOOP.bind(null);
}

/**
 * EZLog namespace.
 * Can be used as a logger with default component name and topics.
 * @namespace
 * @borrows EZLogger#log as log
 * @borrows EZLogger#onLog as onLog
 * @borrows EZLogger#getLogById as getLogById
 * @borrows EZLogger#count as count
 * @borrows EZLogger#getLatestLogs as getLatestLogs
 * @borrows EZLogger#getEarliestLogs as getEarliestLogs
 * @borrows EZLogger#wipe as wipe
 * @borrows EZLogger#publish as publish
 * @borrows EZLogger#subscribe as subscribe
 */
EZLog = new self({
  "component": self._CONSTS.DefaultComponent,
  "topics": self._CONSTS.DefaultTopics
});

/**
 * Create an EZLogger instance.
 * @param {Object} [options] - Optional configurations.
 * @param {String} [options.component] - The name of the component this logger is for. The value is case-insensitive. Default is `"default"`.
 * @param {Array.<String>} [options.topics] - A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`.
 * @returns {EZLogger}
 */
EZLog.createLogger = function (options) {
  return new self(options);
};

helpers = {
  namespace,
  logCollection,
  indexes,
  NOOP,
  verifyLogContent,
  makeArray,
  sliceArguments
};
