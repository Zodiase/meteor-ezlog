const logCollection = new Mongo.Collection('zodiase:ezlog/logs');

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

class DefaultLogger {
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
    DefaultLogger._identityCheck(logger);
    verifyLogContent(content);
    try {
      check(logger._loggerId, String);
      check(logger.component, String);
      check(logger.topics, [String]);
    } catch (error) {
      throw new Error('Invalid input.');
    }
    let newLog = {
      'createdAt': Date.now(),
      'logger': DefaultLogger._loggerId,
      'component': logger.component,
      'topics': logger.topics,
      'content': content
    }
    let newlogId = logCollection.insert(newLog);
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
      'component': logger.component,
      'topics': logger.topics
    }, {
      'fields': DefaultLogger._returnLogFields
    });
    return log;
  }

  // Log something. Supports unlimited amount of arguments.
  static log (content) {
    let logId = DefaultLogger._log(DefaultLogger, arguments);
    return logId;
  }
  // Register a function to be called when there is a new log.
  static onLog (callback) {
    DefaultLogger._onLog(DefaultLogger, callback);
  }
  static getLogById (id) {
    return DefaultLogger._getLogById(DefaultLogger, id);
  }

  constructor (options) {
    let self = this;
    if (typeof options === 'undefined') {
      options = {};
    }
    self.component = String(options.component) || 'default';
    // Make topics an array.
    options.topics = makeArray(options.topics);
    // Convert all items to string.
    options.topics = options.topics.map(String);
    self.topics = options.topics;

    self._loggerId = DefaultLogger._loggerId;
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
  }
  // Log something. Supports unlimited amount of arguments.
  log (arg0, arg1, arg2, argN) {
    DefaultLogger._contextCheck(this);
    let logId = DefaultLogger._log(this, arguments);
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
}
DefaultLogger._returnLogFields = {
  'createdAt': 1,
  'logger': 1,
  'component': 1,
  'topics': 1,
  'content': 1
};
DefaultLogger._loggerId = 'default';
DefaultLogger.component = 'default';
DefaultLogger.topics = [];
// This stores all the callbacks used by DefaultLogger.
DefaultLogger._callbacks = {
  'onLog': []
};
DefaultLogger._triggerCallbacksFor = {
  'onLog': function (id, fields) {
    for (let cb of DefaultLogger._callbacks.onLog) {
      cb(id, fields);
    }
  }
};

EZLog = function () {
  // Should not be used as a constructor.
  if (this instanceof EZLog) {
    throw new Error('EZLog can not be used as a constructor. Call directly instead.');
  }
};

EZLog.DefaultLogger = DefaultLogger;
// EZLog.log mirrors EZLog.DefaultLogger.log.
EZLog.log = EZLog.DefaultLogger.log;
// EZLog.onLog mirrors EZLog.DefaultLogger.onLog.
EZLog.onLog = EZLog.DefaultLogger.onLog;
// EZLog.getLogById mirrors EZLog.DefaultLogger.getLogById.
EZLog.getLogById = EZLog.DefaultLogger.getLogById;







// Register a function to be called when there is a new log.
/*
EZLog.onLog = function (callback) {
  EZLog._callbacks.onLog.push(callback);
};
// This stores all the callbacks used by EZLog.
EZLog._callbacks = {
  'onLog': []
};
// This stores all the observers used by EZLog.
EZLog._observers = {
  // Monitor logCollection and trigger onLog callbacks.
  'overwatch': logCollection.find({}, {
    'sort': {},
    'fields': {}
  }).observeChanges({
    'added': function (id, fields) {
      if (EZLog._initializing) {
        return;
      }
      //else
      for (let cb of EZLog._callbacks.onLog) {
        cb(id);
      }
    }
  })
};
*/
