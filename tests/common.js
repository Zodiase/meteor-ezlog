let callTargets = {};
Meteor.methods({
  "count": function (target) {
    if (callTargets[target]) {
      return callTargets[target].count();
    }
    return false;
  },
  "wipe": function (target) {
    if (callTargets[target]) {
      return callTargets[target].wipe();
    }
    return false;
  },
  "log": function (target, content) {
    if (callTargets[target]) {
      return callTargets[target].log.apply(callTargets[target], content);
    }
    return false;
  },
  "publish": function (target) {
    if (callTargets[target]) {
      callTargets[target].publish();
      return true;
    }
    return false;
  }
});

let apis = ['log', 'onLog', 'getLogById', 'count', 'getLatestLogs', 'getEarliestLogs', 'wipe', 'publish', 'subscribe'];

Tinytest.add('EZLog basics', function (test) {

  test.equal(typeof EZLog, 'object', 'typeof EZLog is object');
  // Can not use EZLog as a constructor.
  test.throws(function () {
    let logger = new EZLog();
  });

});

Tinytest.add('EZLog.Base is an abstract class', function (test) {

  test.equal(typeof EZLog.Base, 'function', 'typeof EZLog.Base is function');
  // Can not use EZLog.Base as a constructor.
  test.throws(function () {
    let logger = new EZLog.Base();
  });
  // Can not call any of the static methods or instance methods.
  for (let methodName of apis) {
    test.throws(EZLog.Base[methodName]);
    test.throws(EZLog.Base.prototype[methodName]);
  }
  // Can not instantiate a non-fully-implemented class.
  test.throws(function () {
    let BadClass = class BadClass extends EZLog.Base {};
    let badInstance = new BadClass();
  });
});

Tinytest.add('EZLog.DefaultLogger inherits from EZLog.Base', function (test) {
  test.equal(typeof EZLog.DefaultLogger, 'function', 'typeof EZLog.DefaultLogger is function');
  test.instanceOf(EZLog.DefaultLogger.prototype, EZLog.Base, 'EZLog.DefaultLogger inherits from EZLog.Base.');
});
testBasicAPIs('EZLog.DefaultLogger', EZLog.DefaultLogger);
testBasicAPIs('EZLog.DefaultLogger instance', new EZLog.DefaultLogger({
  'component': 'test',
  'topics': [
    'fake',
    'test'
  ]
}));

Tinytest.add('Loggers with same signatures share callbacks', function (test) {
  let signature = {
    'component': 'test',
    'topics': [
      'fake',
      'test'
    ]
  };
  let loggerA = new EZLog.DefaultLogger(signature);
  let loggerB = new EZLog.DefaultLogger(signature);

  let flag = false;
  loggerA.onLog(function (id) {
    flag = true;
  });
  loggerB.log('test');
  test.equal(flag, true, 'Log captured across loggers');
});

Tinytest.add('Loggers with different signatures do not share callbacks', function (test) {
  let loggerA = new EZLog.DefaultLogger({
    'component': 'test',
    'topics': [
      'fake',
      'testA'
    ]
  });
  let loggerB = new EZLog.DefaultLogger({
    'component': 'test',
    'topics': [
      'fake',
      'testB'
    ]
  });

  let flag = false;
  loggerA.onLog(function (id) {
    flag = true;
  });
  loggerB.log('test');
  test.equal(flag, false, 'Log not captured across loggers');
});

Tinytest.add('Loggers with no topics can fetch logs with topics', function (test) {
  let rootLogger = new EZLog.DefaultLogger({
    'component': 'test'
  });
  let childLogger = new EZLog.DefaultLogger({
    'component': 'test',
    'topics': [
      'child'
    ]
  });

  let flag = false;
  rootLogger.onLog(function (id) {
    flag = true;
  });
  childLogger.log('test');
  test.equal(flag, false, 'Log captured by root logger');
});

Tinytest.add('EZLog properties', function (test) {
  let mirroredProperties = apis;
  for (let propName of mirroredProperties) {
    test.equal(EZLog[propName], EZLog.DefaultLogger[propName], 'EZLog.' + propName + ' mirrors EZLog.DefaultLogger.' + propName + '');
  }
});

function testBasicAPIs (name, logger) {

  // Register the call target so the client test can finish.
  if (Meteor.isServer) {
    callTargets[name] = logger;
  }

  Tinytest.add(name + ' method definitions check', function (test) {
    let methods = apis;
    for (let propName of methods) {
      test.equal(typeof logger[propName], 'function', 'typeof .' + propName + ' is function');
    }
  });

  Tinytest.add(name + ' log() returns an ID', function (test) {
    test.isNotUndefined(logger.log('test'), '.log() returns an ID');
  });

  Tinytest.add(name + ' onLog() can register log callback', function (test) {
    let flag = false;
    logger.onLog(function (id) {
      flag = true;
    });
    logger.log('test');
    test.equal(flag, true, 'Log captured');
  });

  Tinytest.add(name + ' onLog() can register multiple log callbacks', function (test) {
    let flags = [
      false,
      false
    ];
    let callback = function (flags, index, id) {
      flags[index] = true;
    };
    // Register first callback.
    logger.onLog(callback.bind(null, flags, 0));
    // Register second callback.
    logger.onLog(callback.bind(null, flags, 1));
    logger.log('test');
    test.equal(flags[0], true, 'Callback 1 registered');
    test.equal(flags[1], true, 'Callback 2 registered');
  });

  Tinytest.add(name + ' count() returns a number', function (test) {
    test.equal(typeof logger.count(), 'number', '.count() returns a number');
  });

  Tinytest.add(name + ' count() returns correct count', function (test) {
    let logCount = logger.count();
    logger.onLog(function (id) {
      logCount++;
    });
    logger.log('test');
    test.equal(logCount, logger.count(), 'Log count correct');
  });

  Tinytest.add(name + ' getLogById() returns the correct log content', function (test) {
    let logContent = ['test'];
    let logId = logger.log.apply(logger, logContent);
    let fetchedLog = logger.getLogById(logId);
    test.isNotUndefined(fetchedLog, '.getLogById() returns something');
    test.equal(aryEqual(logContent, fetchedLog.content), true, '.getLogById() returns correct log content');
  });

  Tinytest.add(name + ' latestLog(1) returns the correct log', function (test) {
    let logContent = ['test'];
    logger.log.apply(logger, logContent);
    let latestLogs = logger.getLatestLogs(1);
    test.isNotUndefined(latestLogs, '.latestLog() returns something');
    test.equal(latestLogs.length, 1, '.latestLog() returns correct amount of items');
    test.equal(aryEqual(logContent, latestLogs[0].content), true, '.latestLog() returns correct logs');
  });

  // Only test wipe on server.
  if (Meteor.isServer) {
    Tinytest.add(name + ' wipe() removes existing logs', function (test) {
      logger.wipe();
      // Wipe would leave 1 log.
      test.equal(logger.count(), 1, 'Log wiped');
    });
  }

  Tinytest.add(name + ' latestLog() returns the logs sorted correctly', function (test) {
    let logContents = [
      ['a'], ['b'], ['c'], ['d'], ['e']
    ];
    for (let logContent of logContents) {
      logger.log.apply(logger, logContent);
    }
    let latestLogs = logger.getLatestLogs(logContents.length);
    test.equal(logContents.length, latestLogs.length, 'log count correct');
    let correctCount = 0;
    for (let i = 0, n = logContents.length; i < n; i++) {
      let val1 = latestLogs[i].content,
          val2 = logContents[n - 1 - i];
      if (aryEqual(val1, val2)) {
        correctCount++;
      }
    }
    test.equal(correctCount, logContents.length, 'latest logs sort correct');
  });

  // Client has not yet subscribed to server side yet.
  // So client only has its own data.
  // A wipe on the server would wipe all client data when synced.
  // The wipe log on the server does not show up on client.
  if (Meteor.isClient) {
    Tinytest.addAsync(name + ' execute wipe()', function (test, next) {
      // Start watching log count, since after the wipe takes effect on the client, a new wipe log will be inserted.
      Tracker.autorun(function (comp) {
        let logCounts = logger.count();
        if (logCounts === 0) {
          comp.stop();
          next();
        }
      });
      Meteor.call('wipe', name);
    });
    Tinytest.add(name + ' earliest() returns the logs sorted correctly', function (test) {
      let logContents = [
        ['a'], ['b'], ['c'], ['d'], ['e']
      ];
      for (let logContent of logContents) {
        logger.log.apply(logger, logContent);
      }
      let earliestLogs = logger.getEarliestLogs(logContents.length);
      test.equal(logContents.length, earliestLogs.length, 'log count correct');
      correctCount = 0;
      for (let i = 0, n = logContents.length; i < n; i++) {
        let val1 = earliestLogs[i].content,
            val2 = logContents[i];
        if (aryEqual(val1, val2)) {
          correctCount++;
        }
      }
      test.equal(correctCount, logContents.length, 'earliest logs sort correct');
    });
  }
  // Register the wipe target on server.
  if (Meteor.isServer) {
    callTargets[name] = logger;
    Tinytest.add(name + ' earliest() returns the logs sorted correctly', function (test) {
      logger.wipe();
      let logContents = [
        ['a'], ['b'], ['c'], ['d'], ['e']
      ];
      for (let logContent of logContents) {
        logger.log.apply(logger, logContent);
      }
      let earliestLogs = logger.getEarliestLogs(logContents.length + 1);
      // Get rid of the first log that was created by the wipe.
      earliestLogs.shift();
      test.equal(logContents.length, earliestLogs.length, 'log count correct');
      correctCount = 0;
      for (let i = 0, n = logContents.length; i < n; i++) {
        let val1 = earliestLogs[i].content,
            val2 = logContents[i];
        if (aryEqual(val1, val2)) {
          correctCount++;
        }
      }
      test.equal(correctCount, logContents.length, 'earliest logs sort correct');
    });
  }

  // Pub/sub is only testable from client side.
  let subHandle = null;
  if (Meteor.isClient) {
    Tinytest.addAsync(name + ' pub/sub connection', function (test, next) {
      Meteor.call('publish', name, function (error, result) {
        subHandle = logger.subscribe(1);
        Tracker.autorun(function (comp) {
          if (subHandle.ready()) {
            comp.stop();
            next();
          }
        });
      });
    });

    Tinytest.addAsync(name + ' pub/sub sync', function (test, next) {
      if (!subHandle) {
        next();
      } else {
        // Ask the server to create a log.
        let logContent = ['test'];
        Meteor.call('log', name, logContent, function (error, result) {
          if (error) {
            throw error;
          } else {
            // Wait till the log is synced to client and match the content.
            let logId = result;
            Tracker.autorun(function (comp) {
              let lastLogs = logger.getLatestLogs(1);
              if (lastLogs.length === 1) {
                let lastLog = lastLogs[0];
                if (lastLog._id === logId) {
                  test.equal(lastLog.content, logContent, 'sync content');
                  next();
                }
              }
            });
          }
        });
      }
    });

    Tinytest.add(name + ' pub/sub disconnect', function (test) {
      if (subHandle) {
        subHandle.stop();
      }
    });
  }

  if (Meteor.isClient) {
    Tinytest.addAsync(name + ' clean up', function (test, next) {
      Meteor.call('wipe', name, function (error, result) {
        if (error) {
          throw error;
        } else {
          Meteor.call('count', name, function (error, result) {
            if (error) {
              throw error;
            } else {
              test.equal(result, 1, 'count() after wipe() should be 1.');
              next();
            }
          });
        }
      });
    });
  }
  if (Meteor.isServer) {
    Tinytest.add(name + ' clean up', function (test) {
      logger.wipe();
    });
  }
}

function aryEqual(ary1, ary2) {
  if (ary1.length != ary2.length) {
    return false;
  } else {
    for (let i = 0, n = ary1.length; i < n; i++) {
      if (ary1[i] != ary2[i]) {
        return false;
      }
    }
    return true;
  }
}
