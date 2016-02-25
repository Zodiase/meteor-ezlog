const {
  namespace,
  logCollection,
  NOOP,
  verifyLogContent,
  makeArray,
  sliceArguments,
  createMirror
} = helpers;

/**
 * Default logger class.
 * Instantiate this with custom component name and topics.
 * @class
 * @extends EZLog.Base
 * @memberof EZLog
 */
class DefaultLogger extends EZLog.Base {

  /**
   * Helper function for generating pub/sub names.
   * @private
   * @param {DefaultLogger} logger - The targeted logger instance.
   * @return {String} The pub/sub name.
   */
  static _getPublishName (logger) {
    return namespace + DefaultLogger._CONSTS.LoggerId + '/' + logger.signature;
  }

  /**
   * Helper function for checking if the logger is an instance of this class or is the singleton.
   * @private
   * @param {DefaultLogger} logger - The targeted logger instance.
   * @throws {Error} `logger` must be an instance of this class or is the singleton.
   */
  static _identityCheck (logger) {
    if (!(logger instanceof DefaultLogger || logger === DefaultLogger)) {
      throw new Error('Illegal invocation');
    }
  }

  /**
   * Helper function for generating filter patterns for topics.
   * @private
   * @param {DefaultLogger} logger - The targeted logger instance.
   * @return {Array.<String>|{$exists: true}} The filter pattern.
   */
  static _getTopicsFilter (logger) {
    return (logger.topics.length > 0) ? logger.topics : DefaultLogger._CONSTS.ExistsFilter;
  }

  /**
   * Trigger callbacks of this logger for this event.
   * @private
   * @param {DefaultLogger} logger
   * @param {String} eventName
   * @param {Array.<*>} data
   */
  static _triggerCallbacks (logger, eventName, data) {
    DefaultLogger._identityCheck(logger);
    check(eventName, String, "Event name should be a String.");
    check(data, Array, "Data should be an Array of items.");

    // @type {Object.<String, Array.<Function>>}
    let callbacks = DefaultLogger._DATA.callbacks[eventName];
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
   * @param {DefaultLogger} logger
   * @param {String} eventName
   * @param {Function} callback
   */
  static _registerCallback (logger, eventName, callback) {
    DefaultLogger._identityCheck(logger);
    check(eventName, String, "Event name should be a String.");
    check(callback, Function, "Callback should be a function.");

    // @type {Object.<String, Object.<String, Array.<Function>>>}
    let allCBs = DefaultLogger._DATA.callbacks;
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
    let allOBs = DefaultLogger._DATA.observers;
    // @type {Object.<String, Observer>}
    let observers = allOBs[eventName] = allOBs[eventName] || {};

    if (!observers[logger.signature]) {
      // Setup observer.
      // New logs on the same platform would have already triggered onLog callbacks.
      // Observer is only used for logs created at the other platform.
      let cursor = logCollection.find({
        'platform': Number(!Meteor.isClient),
        'logger': DefaultLogger._CONSTS.LoggerId,
        'component': logger.component,
        'topics': DefaultLogger._getTopicsFilter(logger)
      }, {
        'fields': DefaultLogger._CONSTS.ReturnIdOnly
      });
      let observer = cursor.observeChanges({
        'added': function (eventName, id, fields) {
          let logger = this;

          let allOBs = DefaultLogger._DATA.observers;
          let observers = allOBs[eventName] = allOBs[eventName] || {};

          // This callback may be called multiple times for the initial find results. Do nothing.
          if (!observers[logger.signature]) return;

          if (Meteor.isClient) {
            // Multiple logs may pop up due to subscribing. If the subscription is not ready, these logs are not new.
            let subscriptions = DefaultLogger._DATA.subscriptions;
            if (!subscriptions[logger.signature].ready()) return;
          }

          let newLog = logger.getLogById(id);
          // Trigger onLog handlers synchronously.
          DefaultLogger._triggerCallbacks(logger, DefaultLogger._CONSTS.EventNames.OnLog, [id, newLog]);
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
    let logItems = DefaultLogger._getEarliestLogs(logger, count);
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
   * Create a default logger.
   * @constructs EZLog.DefaultLogger
   * @param {Object} [options] - Optional configurations.
   * @param {String} [options.component] - The name of the component this logger is for. The value is case-insensitive. Default is `"default"`.
   * @param {Array.<String>} [options.topics] - A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`.
   */
  constructor (options) {
    super();

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

  log (item) {
    let createdAt = Date.now();
    DefaultLogger._identityCheck(this);

    let content = sliceArguments(arguments);

    verifyLogContent(content);
    check(this.component, String, "Logger has invalid component name.");
    check(this.topics, [String], "Logger has invalid topics.");

    let timeCollision = Number(DefaultLogger._DATA.lastLog.createdAt) === Number(createdAt);
    let createdOrder = timeCollision ? (DefaultLogger._DATA.lastLog._createdOrder + 1) : 0;

    let newLog = {
      'createdAt': createdAt,
      '_createdOrder': createdOrder,
      // 1 means client, 0 means server.
      'platform': Number(Meteor.isClient),
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': this.topics,
      'content': content
    }

    let newlogId = logCollection.insert(newLog);

    // Update last log bookkeeping.
    DefaultLogger._DATA.lastLog._id = newlogId;
    DefaultLogger._DATA.lastLog.createdAt = createdAt;
    DefaultLogger._DATA.lastLog._createdOrder = createdOrder;

    // Fetch the new log from collection.
    newLog = this.getLogById(newlogId);

    // Trigger onLog handlers synchronously.
    DefaultLogger._triggerCallbacks(this, DefaultLogger._CONSTS.EventNames.OnLog, [newlogId, newLog]);

    return newlogId;
  }

  onLog (callback) {
    DefaultLogger._identityCheck(this);
    check(callback, Function, 'Callback is not a function.');

    DefaultLogger._registerCallback(this, DefaultLogger._CONSTS.EventNames.OnLog, callback);
  }

  getLogById (id) {
    DefaultLogger._identityCheck(this);
    check(id, String, 'Expect id to be a string.');
    let log = logCollection.findOne({
      '_id': id,
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': DefaultLogger._getTopicsFilter(this)
    }, {
      'fields': DefaultLogger._CONSTS.ReturnLogFields
    });
    return log;
  }

  count () {
    DefaultLogger._identityCheck(this);
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': DefaultLogger._getTopicsFilter(this)
    }, {
      'fields': DefaultLogger._CONSTS.ReturnIdOnly
    });
    return cursor.count();
  }

  getLatestLogs (count) {
    DefaultLogger._identityCheck(this);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': DefaultLogger._getTopicsFilter(this)
    }, {
      'sort': DefaultLogger._CONSTS.ReturnLogSort,
      'limit': count,
      'fields': DefaultLogger._CONSTS.ReturnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  getEarliestLogs (count) {
    DefaultLogger._identityCheck(this);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': DefaultLogger._getTopicsFilter(this)
    }, {
      'sort': DefaultLogger._CONSTS.ReturnLogSortReversed,
      'limit': count,
      'fields': DefaultLogger._CONSTS.ReturnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  wipe () {
    DefaultLogger._identityCheck(this);
    let removeCount = logCollection.remove({
      'logger': DefaultLogger._CONSTS.LoggerId,
      'component': this.component,
      'topics': DefaultLogger._getTopicsFilter(this)
    });
    // Log wipe.
    this.log('Logs Wiped.');
    return removeCount;
  }

  publish () {
    DefaultLogger._identityCheck(this);
    let publishName = DefaultLogger._getPublishName(this);
    Meteor.publish(publishName, function (limit) {
      check(limit, Match.Integer);
      let cursor = logCollection.find({
        'logger': DefaultLogger._CONSTS.LoggerId,
        'component': this.component,
        'topics': DefaultLogger._getTopicsFilter(this)
      }, {
        'sort': DefaultLogger._CONSTS.ReturnLogSort,
        'limit': limit,
        'fields': DefaultLogger._CONSTS.PublishLogFields
      });
      return cursor;
    }.bind(this));
  }

  subscribe (limit) {
    DefaultLogger._identityCheck(this);

    let subscriptions = DefaultLogger._DATA.subscriptions;
    if (subscriptions[this.signature]) {
      subscriptions[this.signature].stop();
      delete subscriptions[this.signature];
    }

    let publishName = DefaultLogger._getPublishName(this);
    subscriptions[this.signature] = Meteor.subscribe(publishName, limit);
    return subscriptions[this.signature];
  }
}

/**
 * Gather all constants here for easy management.
 * @private
 */
DefaultLogger._CONSTS = {
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
DefaultLogger._DATA = {
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
  DefaultLogger.prototype.publish = NOOP.bind(null, null);
  DefaultLogger.prototype.wipe = NOOP.bind(null, 0);
}
if (Meteor.isServer) {
  DefaultLogger.prototype.subscribe = NOOP.bind(null);
}

// Create the singleton.
DefaultLogger._singleton = new DefaultLogger({
  "component": DefaultLogger._CONSTS.DefaultComponent,
  "topics": DefaultLogger._CONSTS.DefaultTopics
});
// Map singleton methods to the class.
Object.getOwnPropertyNames(DefaultLogger.prototype).forEach(function (propName, index) {
  if (typeof DefaultLogger.prototype[propName] === 'function' && propName != 'constructor') {
    DefaultLogger[propName] = DefaultLogger.prototype[propName].bind(DefaultLogger._singleton);
  }
});

// Attach to namespace.
EZLog.DefaultLogger = DefaultLogger;
createMirror(EZLog.DefaultLogger, EZLog);
