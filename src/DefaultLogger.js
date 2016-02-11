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
 * @class
 * @extends EZLog.Base
 * @memberof EZLog
 */
class DefaultLogger extends EZLog.Base {

  /**
   * Helper function for initializing DefaultLogger singleton and its instances.
   * @private
   * @param {DefaultLogger} self - The instance to be initialized.
   * @param {Object} options - Same options as the constructor.
   */
  static _initialize (self, options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    self.component = String(options.component).toLowerCase() || 'default';
    // Make topics a sorted array of lowercase Strings.
    self.topics = makeArray(options.topics).map((x) => String(x).toLowerCase()).sort((a, b) => a > b);

    // This stores all the callbacks used by this instance.
    self._callbacks = {
      'onLog': []
    };
    self._triggerCallbacksFor = {
      'onLog': function (id, fields) {
        for (let cb of self._callbacks.onLog) {
          cb(id, fields);
        }
      }
    };
    // Stores the ID and time of the last log.
    self._lastLog = {
      '_id': '',
      'createdAt': null,
      // In case two logs have the same log time, increment this field to
      // distinguish the order of creation.
      '_createdOrder': 0
    };
  }

  /**
   * Helper function for generating pub/sub names.
   * @private
   * @param {DefaultLogger} logger - The targeted logger instance.
   * @return {String} The pub/sub name.
   */
  static _getPublishName (logger) {
    return namespace + DefaultLogger._loggerId + '/' + logger.component;
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
   * Helper function for checking if the context is an instance of this class.
   * @private
   * @param {DefaultLogger} self - The context.
   * @throws {Error} `self` must be an instance of this class.
   */
  static _contextCheck (self) {
    if (!(self instanceof DefaultLogger)) {
      throw new Error('Illegal invocation');
    }
  }

  /**
   * @private
   */
  static _log (logger, content) {
    let createdAt = Date.now();
    DefaultLogger._identityCheck(logger);
    verifyLogContent(content);
    try {
      check(logger.component, String);
      check(logger.topics, [String]);
    } catch (error) {
      throw new Error('Invalid input.');
    }

    let timeCollision = Number(logger._lastLog.createdAt) === Number(createdAt);
    let createdOrder = timeCollision ? (logger._lastLog._createdOrder + 1) : 0;

    let newLog = {
      'createdAt': createdAt,
      '_createdOrder': createdOrder,
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics,
      'content': content
    }
    let newlogId = logCollection.insert(newLog);
    // Update last log bookkeeping.
    logger._lastLog = {
      '_id': newlogId,
      'createdAt': createdAt,
      '_createdOrder': createdOrder
    };
    // Fetch the new log from collection.
    newLog = DefaultLogger._getLogById(logger, newlogId);
    // Trigger onLog handlers synchronously.
    logger._triggerCallbacksFor.onLog(newlogId, newLog);
    return newlogId;
  }

  /**
   * @private
   */
  static _onLog (logger, callback) {
    DefaultLogger._identityCheck(logger);
    check(callback, Function, 'Callback is not a function.');
    logger._callbacks.onLog.push(callback);
  }

  /**
   * @private
   */
  static _getLogById (logger, id) {
    DefaultLogger._identityCheck(logger);
    check(id, String, 'Expect id to be a string.');
    let log = logCollection.findOne({
      '_id': id,
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics
    }, {
      'fields': DefaultLogger._returnLogFields
    });
    return log;
  }

  /**
   * @private
   */
  static _count (logger) {
    DefaultLogger._identityCheck(logger);
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics
    }, {
      'fields': {
        '_id': 1
      }
    });
    return cursor.count();
  }

  /**
   * @private
   */
  static _getLatestLogs (logger, count) {
    DefaultLogger._identityCheck(logger);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics
    }, {
      'sort': [
        ['createdAt', 'desc'],
        ['_createdOrder', 'desc']
      ],
      'limit': count,
      'fields': DefaultLogger._returnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  /**
   * @private
   */
  static _getEarliestLogs (logger, count) {
    DefaultLogger._identityCheck(logger);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics
    }, {
      'sort': [
        ['createdAt', 'asc'],
        ['_createdOrder', 'asc']
      ],
      'limit': count,
      'fields': DefaultLogger._returnLogFields
    });
    let logItems = cursor.fetch();
    return logItems;
  }

  /**
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
   * @private
   */
  static _wipe (logger) {
    DefaultLogger._identityCheck(logger);
    let removeCount = logCollection.remove({
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics
    });
    // Log wipe.
    logger.log('Logs Wiped.');
    return removeCount;
  }

  /**
   * @private
   */
  static _publish (logger) {
    DefaultLogger._identityCheck(logger);
    let publishName = DefaultLogger._getPublishName(logger);
    Meteor.publish(publishName, function (limit) {
      check(limit, Match.Integer);
      let cursor = logCollection.find({
        'logger': DefaultLogger._loggerId,
        'component': logger.component,
        'topics': logger.topics
      }, {
        'sort': [
          ['createdAt', 'desc'],
          ['_createdOrder', 'desc']
        ],
        'limit': limit,
        'fields': DefaultLogger._returnLogFields
      });
      return cursor;
    });
  }

  /**
   * @private
   */
  static _subscribe (logger, limit) {
    DefaultLogger._identityCheck(logger);
    let publishName = DefaultLogger._getPublishName(logger);
    return Meteor.subscribe(publishName, limit);
  }

  /**
   * @static
   * @inheritdoc
   */
  static log (item) {
    let args = sliceArguments(arguments);
    let logId = DefaultLogger._log(DefaultLogger, args);
    return logId;
  }
  /** @inheritdoc */
  static onLog (callback) {
    DefaultLogger._onLog(DefaultLogger, callback);
  }
  /** @inheritdoc */
  static getLogById (id) {
    return DefaultLogger._getLogById(DefaultLogger, id);
  }
  /** @inheritdoc */
  static count () {
    return DefaultLogger._count(DefaultLogger);
  }
  /** @inheritdoc */
  static getLatestLogs (count) {
    return DefaultLogger._getLatestLogs(DefaultLogger, count);
  }
  /** @inheritdoc */
  static getEarliestLogs (count) {
    return DefaultLogger._getEarliestLogs(DefaultLogger, count);
  }
  /** @inheritdoc */
  static wipe () {
    return DefaultLogger._wipe(DefaultLogger);
  }
  /** @inheritdoc */
  static publish () {
    return DefaultLogger._publish(DefaultLogger);
  }
  /** @inheritdoc */
  static subscribe (limit) {
    return DefaultLogger._subscribe(DefaultLogger, limit);
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
    DefaultLogger._initialize(this, options);
  }

  /** @inheritdoc */
  log (item) {
    DefaultLogger._contextCheck(this);
    let args = sliceArguments(arguments);
    let logId = DefaultLogger._log(this, args);
    return logId;
  }
  /** @inheritdoc */
  onLog (callback) {
    DefaultLogger._contextCheck(this);
    DefaultLogger._onLog(this, callback);
  }
  /** @inheritdoc */
  getLogById (id) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getLogById(this, id);
  }
  /** @inheritdoc */
  count () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._count(this);
  }
  /** @inheritdoc */
  getLatestLogs (count) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getLatestLogs(this, count);
  }
  /** @inheritdoc */
  getEarliestLogs (count) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getEarliestLogs(this, count);
  }
  /** @inheritdoc */
  wipe () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._wipe(this);
  }
  /** @inheritdoc */
  publish () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._publish(this);
  }
  /** @inheritdoc */
  subscribe (limit) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._subscribe(this, limit);
  }
}
DefaultLogger._returnLogFields = {
  'createdAt': 1,
  'logger': 1,
  'component': 1,
  'topics': 1,
  'content': 1
};
DefaultLogger._loggerId = 'default';
// Use the constructor to initialize static properties.
DefaultLogger._initialize(DefaultLogger, {
  'component': 'default',
  'topics': []
});

const self = DefaultLogger;

// Remove unsupported functions.
if (Meteor.isClient) {
  self._publish = NOOP.bind(null);
  self._wipe = NOOP.bind(null, 0);
}
if (Meteor.isServer) {
  self._subscribe = NOOP.bind(null);
}

EZLog.DefaultLogger = DefaultLogger;
createMirror(EZLog.DefaultLogger, EZLog);
