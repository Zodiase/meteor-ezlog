const namespace = 'zodiase:ezlog/';
const logCollection = new Mongo.Collection(namespace + 'logs');
logCollection.deny({
  'insert': function (userId, doc) {
    return true;
  },
  'update': function (userId, doc, fieldNames, modifier) {
    return true;
  },
  'remove': function (userId, doc) {
    return true;
  }
});

// Set indexes.
const indexes = {
  'createdAt': 1,
  'logger': 1,
  'component': 'text',
  'topics': 1,
}
//logCollection._dropIndex('');
logCollection._ensureIndex(indexes);

const NOOP = function () {
  console.log('NOOP called.'); //!
};

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
}

class DefaultLogger {
  static _initialize (self, options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    self.component = String(options.component) || 'default';
    // Make topics an array.
    options.topics = makeArray(options.topics);
    // Convert all items to string.
    options.topics = options.topics.map(String);
    self.topics = options.topics;

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
  // Internal function, not intended to be used directly.
  static _identityCheck (logger) {
    if (!(logger instanceof DefaultLogger || logger === DefaultLogger)) {
      throw new Error('Illegal invocation');
    }
  }
  // Internal function, not intended to be used directly.
  static _contextCheck (self) {
    if (!(self instanceof DefaultLogger)) {
      throw new Error('Illegal invocation');
    }
  }
  // Internal function, not intended to be used directly.
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
    // Trigger onLog handlers synchronously.
    logger._triggerCallbacksFor.onLog(newlogId, newLog);
    return newlogId;
  }
  // Internal function, not intended to be used directly.
  static _onLog (logger, callback) {
    DefaultLogger._identityCheck(logger);
    check(callback, Function, 'Callback is not a function.');
    logger._callbacks.onLog.push(callback);
  }
  // Internal function, not intended to be used directly.
  static _getLogById (logger, id) {
    DefaultLogger._identityCheck(logger);
    check(id, String, 'Expect id to be a string.');
    let log = logCollection.findOne({
      '_id': id,
      'logger': DefaultLogger._loggerId,
      'component': logger.component
    }, {
      'fields': DefaultLogger._returnLogFields
    });
    return log;
  }
  // Internal function, not intended to be used directly.
  static _count (logger) {
    DefaultLogger._identityCheck(logger);
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component
    }, {
      'fields': {
        '_id': 1
      }
    });
    return cursor.count();
  }
  // Internal function, not intended to be used directly.
  static _getLatestLogs (logger, count) {
    DefaultLogger._identityCheck(logger);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component
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
  // Internal function, not intended to be used directly.
  static _getEarliestLogs (logger, count) {
    DefaultLogger._identityCheck(logger);
    check(count, Match.Integer, 'Expect count to be an integer.');
    if (count <= 0) {
      throw new RangeError('Expect count to be a positive integer.');
    }
    //else
    let cursor = logCollection.find({
      'logger': DefaultLogger._loggerId,
      'component': logger.component
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
  // Internal function, not intended to be used directly.
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
  // Internal function, not intended to be used directly.
  static _wipe (logger) {
    DefaultLogger._identityCheck(logger);
    let removeCount = logCollection.remove({
      'logger': DefaultLogger._loggerId,
      'component': logger.component
    });
    // Log wipe.
    logger.log('Logs Wiped.');
    return removeCount;
  }
  // Internal function, not intended to be used directly.
  static _publish (logger) {
    DefaultLogger._identityCheck(logger);
    let publishName = namespace + DefaultLogger._loggerId + '/' + logger.component;
    Meteor.publish(publishName, function (count) {
      let cursor = logCollection.find({
        'logger': DefaultLogger._loggerId,
        'component': logger.component
      }, {
        'sort': [
          ['createdAt', 'desc'],
          ['_createdOrder', 'desc']
        ],
        'limit': count,
        'fields': DefaultLogger._returnLogFields
      });
      return cursor;
    });
  }

  // Log something. Supports unlimited amount of arguments.
  static log (arg0, arg1, arg2, argN) {
    let args = sliceArguments(arguments);
    let logId = DefaultLogger._log(DefaultLogger, args);
    return logId;
  }
  // Register a function to be called when there is a new log.
  static onLog (callback) {
    DefaultLogger._onLog(DefaultLogger, callback);
  }
  static getLogById (id) {
    return DefaultLogger._getLogById(DefaultLogger, id);
  }
  static count () {
    return DefaultLogger._count(DefaultLogger);
  }
  static getLatestLogs (count) {
    return DefaultLogger._getLatestLogs(DefaultLogger, count);
  }
  static getEarliestLogs (count) {
    return DefaultLogger._getEarliestLogs(DefaultLogger, count);
  }
  static wipe () {
    return DefaultLogger._wipe(DefaultLogger);
  }
  static publish () {
    return DefaultLogger._publish(DefaultLogger);
  }

  constructor (options) {
    DefaultLogger._initialize(this, options);
  }
  // Log something. Supports unlimited amount of arguments.
  log (arg0, arg1, arg2, argN) {
    DefaultLogger._contextCheck(this);
    let args = sliceArguments(arguments);
    let logId = DefaultLogger._log(this, args);
    return logId;
  }
  // Register a function to be called when there is a new log.
  onLog (callback) {
    DefaultLogger._contextCheck(this);
    DefaultLogger._onLog(this, callback);
  }
  getLogById (id) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getLogById(this, id);
  }
  count () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._count(this);
  }
  getLatestLogs (count) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getLatestLogs(this, count);
  }
  getEarliestLogs (count) {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._getEarliestLogs(this, count);
  }
  wipe () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._wipe(this);
  }
  publish () {
    DefaultLogger._contextCheck(this);
    return DefaultLogger._publish(this);
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

EZLog = function () {
  // Should not be used as a constructor.
  if (this instanceof EZLog) {
    throw new Error('EZLog can not be used as a constructor. Call directly instead.');
  }
};

EZLog.DefaultLogger = DefaultLogger;
let mirroredProperties = [
  'log',
  'onLog',
  'getLogById',
  'count',
  'getLatestLogs',
  'getEarliestLogs',
  'wipe',
  'publish'
];
for (let propName of mirroredProperties) {
  EZLog[propName] = EZLog.DefaultLogger[propName];
}
