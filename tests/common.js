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

Tinytest.add('EZLog basics', function (test) {

  test.equal(typeof EZLog, 'object', 'typeof EZLog is not object');
  test.equal(typeof EZLog.constructor, 'function', 'EZLog is an instance of a class');
  // Can not use EZLog as a constructor.
  test.throws(function () {
    let logger = new EZLog();
  });

});

Tinytest.add('#log() returns an ID', function (test) {
  test.equal(typeof EZLog.log, 'function', 'typeof #log is not function');

  test.isNotUndefined(EZLog.log('test'), '#log() returns an ID');
});

Tinytest.add('#onLog() can register log callback', function (test) {
  test.equal(typeof EZLog.onLog, 'function', 'typeof #onLog is not function');

  let flag = false;
  EZLog.onLog(function (id) {
    flag = true;
  });
  EZLog.log('test');
  test.equal(flag, true, 'Log not captured');
});

Tinytest.add('#onLog() can register multiple log callbacks', function (test) {
  test.equal(typeof EZLog.onLog, 'function', 'typeof #onLog is not function');

  let flags = [
    false,
    false
  ];
  let callback = function (flags, index, id) {
    flags[index] = true;
  };
  // Register first callback.
  EZLog.onLog(callback.bind(null, flags, 0));
  // Register second callback.
  EZLog.onLog(callback.bind(null, flags, 1));
  EZLog.log('test');
  test.equal(flags[0], true, 'Callback 1 is not registered');
  test.equal(flags[1], true, 'Callback 2 is not registered');
});

Tinytest.add('#count() returns a number', function (test) {
  test.equal(typeof EZLog.count, 'function', 'typeof #count is not function');

  test.equal(typeof EZLog.count(), 'number', '#count() does not return a number');
});

Tinytest.add('#count() returns correct count', function (test) {
  test.equal(typeof EZLog.count, 'function', 'typeof #count is not function');

  let logCount = EZLog.count();
  EZLog.onLog(function (id) {
    logCount++;
  });
  EZLog.log('test');
  test.equal(logCount, EZLog.count(), 'Log count incorrect');
});

Tinytest.add('#getLogById() returns the correct log content', function (test) {
  test.equal(typeof EZLog.getLogById, 'function', 'typeof #getLogById is not function');

  let logContent = ['test'];
  let logId = EZLog.log.apply(EZLog, logContent);
  let fetchedLog = EZLog.getLogById(logId);
  test.isNotUndefined(fetchedLog, '#getLogById() returns nothing');
  test.equal(_.isEqual(logContent, fetchedLog.content), true, '#getLogById() returns incorrect log content');
});

Tinytest.add('#getLatestLogs(1) returns the correct log', function (test) {
  test.equal(typeof EZLog.getLatestLogs, 'function', 'typeof #getLatestLogs is not function');

  let logContent = ['test'];
  EZLog.log.apply(EZLog, logContent);
  let latestLogs = EZLog.getLatestLogs(1);
  test.isNotUndefined(latestLogs, '#getLatestLogs() returns nothing');
  test.equal(latestLogs.length, 1, '#getLatestLogs() returns incorrect amount of items');
  test.equal(_.isEqual(logContent, latestLogs[0].content), true, '#getLatestLogs() returns incorrect logs');
});

// Only test wipe on server.
if (Meteor.isServer) {
  Tinytest.add('#wipe() removes existing logs', function (test) {
    test.equal(typeof EZLog.wipe, 'function', 'typeof #wipe is not function');

    EZLog.wipe();
    // Wipe would leave 1 log.
    test.equal(EZLog.count(), 1, 'After wiping, more than 1 log is left.');
  });
}

Tinytest.add('#getLatestLogs() returns the logs sorted correctly', function (test) {
  test.equal(typeof EZLog.getLatestLogs, 'function', 'typeof #getLatestLogs is not function');

  let logContents = [
    ['a'], ['b'], ['c'], ['d'], ['e']
  ];
  for (let logContent of logContents) {
    EZLog.log.apply(EZLog, logContent);
  }
  let latestLogs = EZLog.getLatestLogs(logContents.length);
  test.equal(logContents.length, latestLogs.length, 'log count incorrect');
  let correctCount = 0;
  for (let i = 0, n = logContents.length; i < n; i++) {
    let val1 = latestLogs[i].content,
        val2 = logContents[n - 1 - i];
    if (_.isEqual(val1, val2)) {
      correctCount++;
    }
  }
  test.equal(correctCount, logContents.length, 'latest logs sort incorrect');
});

// Client has not yet subscribed to server side yet.
// So client only has its own data.
// A wipe on the server would wipe all client data when synced.
// The wipe log on the server does not show up on client.
if (Meteor.isClient) {
  Tinytest.addAsync('Execute #wipe()', function (test, next) {
    // Start watching log count, since after the wipe takes effect on the client, a new wipe log will be inserted.
    Tracker.autorun(function (comp) {
      let logCounts = EZLog.count();
      if (logCounts === 0) {
        comp.stop();
        next();
      }
    });
    Meteor.call('wipe', 'singleton');
  });
  Tinytest.add('#getEarliestLogs() returns the logs sorted correctly', function (test) {
    test.equal(typeof EZLog.getEarliestLogs, 'function', 'typeof #getEarliestLogs is not function');

    let logContents = [
      ['a'], ['b'], ['c'], ['d'], ['e']
    ];
    for (let logContent of logContents) {
      EZLog.log.apply(EZLog, logContent);
    }
    let earliestLogs = EZLog.getEarliestLogs(logContents.length);
    test.equal(logContents.length, earliestLogs.length, 'log count incorrect');
    correctCount = 0;
    for (let i = 0, n = logContents.length; i < n; i++) {
      let val1 = earliestLogs[i].content,
          val2 = logContents[i];
      if (_.isEqual(val1, val2)) {
        correctCount++;
      }
    }
    test.equal(correctCount, logContents.length, 'earliest logs sort incorrect');
  });
}
// Register the wipe target on server.
if (Meteor.isServer) {
  callTargets['singleton'] = EZLog;
  Tinytest.add('#getEarliestLogs() returns the logs sorted correctly', function (test) {
    test.equal(typeof EZLog.getEarliestLogs, 'function', 'typeof #getEarliestLogs is not function');

    EZLog.wipe();
    let logContents = [
      ['a'], ['b'], ['c'], ['d'], ['e']
    ];
    for (let logContent of logContents) {
      EZLog.log.apply(EZLog, logContent);
    }
    let earliestLogs = EZLog.getEarliestLogs(logContents.length + 1);
    // Get rid of the first log that was created by the wipe.
    earliestLogs.shift();
    test.equal(logContents.length, earliestLogs.length, 'log count incorrect');
    correctCount = 0;
    for (let i = 0, n = logContents.length; i < n; i++) {
      let val1 = earliestLogs[i].content,
          val2 = logContents[i];
      if (_.isEqual(val1, val2)) {
        correctCount++;
      }
    }
    test.equal(correctCount, logContents.length, 'earliest logs sort incorrect');
  });
}

// Pub/sub is only testable from client side.
let subHandle = null;
if (Meteor.isClient) {
  Tinytest.addAsync('Pub/sub connection', function (test, next) {
    Meteor.call('publish', 'singleton', function (error, result) {
      subHandle = EZLog.subscribe(1);
      Tracker.autorun(function (comp) {
        if (subHandle.ready()) {
          comp.stop();
          next();
        }
      });
    });
  });

  Tinytest.addAsync('Pub/sub sync', function (test, next) {
    if (!subHandle) {
      next();
    } else {
      // Ask the server to create a log.
      let logContent = ['test'];
      Meteor.call('log', 'singleton', logContent, function (error, result) {
        if (error) {
          throw error;
        } else {
          // Wait till the log is synced to client and match the content.
          let logId = result;
          Tracker.autorun(function (comp) {
            let lastLogs = EZLog.getLatestLogs(1);
            if (lastLogs.length === 1) {
              let lastLog = lastLogs[0];
              if (lastLog._id === logId) {
                test.equal(lastLog.content, logContent, 'sync error');
                next();
              }
            }
          });
        }
      });
    }
  });

  Tinytest.add('Pub/sub disconnect', function (test) {
    if (subHandle) {
      subHandle.stop();
    }
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync('Clean up', function (test, next) {
    Meteor.call('wipe', 'singleton', function (error, result) {
      if (error) {
        throw error;
      } else {
        Meteor.call('count', 'singleton', function (error, result) {
          if (error) {
            throw error;
          } else {
            test.equal(result, 1, '`#count()` after `#wipe()` should be 1.');
            next();
          }
        });
      }
    });
  });
}
if (Meteor.isServer) {
  Tinytest.add('Clean up', function (test) {
    EZLog.wipe();
  });
}

Tinytest.add('#createLogger() constructs new EZLogger instances', function (test) {
  test.equal(typeof EZLog.createLogger, 'function', 'typeof #createLogger is not function');

  const signature = {
    'component': 'test',
    'topics': [
      'fake',
      'test'
    ]
  };
  const loggerA = EZLog.createLogger(signature);
  test.isNotUndefined(loggerA, '#createLogger() returns nothing');
  test.equal(loggerA instanceof EZLog.constructor, true, '#createLogger() returns incorrect object');
});

Tinytest.add('Loggers with same signatures share callbacks', function (test) {
  test.equal(typeof EZLog.createLogger, 'function', 'typeof #createLogger is not function');

  const signature = {
    'component': 'test',
    'topics': [
      'fake',
      'test'
    ]
  };
  const loggerA = EZLog.createLogger(signature);
  const loggerB = EZLog.createLogger(signature);

  let flag = false;
  loggerA.onLog(function (id) {
    flag = true;
  });
  loggerB.log('test');
  test.equal(flag, true, 'Unable to capture log across loggers');
});

Tinytest.add('Loggers with different signatures do not share callbacks', function (test) {
  test.equal(typeof EZLog.createLogger, 'function', 'typeof #createLogger is not function');

  const loggerA = EZLog.createLogger({
    'component': 'test',
    'topics': [
      'fake',
      'testA'
    ]
  });
  const loggerB = EZLog.createLogger({
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
  test.equal(flag, false, 'Log captured across loggers');
});

Tinytest.add('Loggers with no topics can fetch logs with topics', function (test) {
  test.equal(typeof EZLog.createLogger, 'function', 'typeof #createLogger is not function');

  const rootLogger = EZLog.createLogger({
    'component': 'test'
  });
  const childLogger = EZLog.createLogger({
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
  test.equal(flag, false, 'Unable to capture log by root logger');
});
