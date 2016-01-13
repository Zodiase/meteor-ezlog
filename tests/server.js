Tinytest.add('EZLog basics', function (test) {

  test.equal(typeof EZLog, 'function', 'typeof EZLog is function');
  // Can not use EZLog as a constructor.
  test.throws(function () {
    let logger = new EZLog();
  });

});

Tinytest.add('EZLog.DefaultLogger class', function (test) {

  test.equal(typeof EZLog.DefaultLogger, 'function', 'typeof EZLog.DefaultLogger is function');
  testBasicAPIs(test, EZLog.DefaultLogger);

});

Tinytest.add('EZLog.DefaultLogger instance', function (test) {

  let logger = new EZLog.DefaultLogger({
    'component': 'test',
    'topics': [
      'fake',
      'test'
    ]
  });
  testBasicAPIs(test, logger);

});

Tinytest.add('EZLog properties', function (test) {

  let mirroredProperties = ['log', 'onLog', 'getLogById', 'count', 'getLatestLogs', 'getEarliestLogs', 'wipe', 'publish'];
  for (let propName of mirroredProperties) {
    test.equal(EZLog[propName], EZLog.DefaultLogger[propName], 'EZLog.' + propName + ' mirrors EZLog.DefaultLogger.' + propName + '');
  }
  testBasicAPIs(test, EZLog);

});

Tinytest.add('Publish', function (test) {

  let logger = new EZLog.DefaultLogger({
    'component': 'test',
    'topics': [
      'publish'
    ]
  });
  logger.publish();

});

function testBasicAPIs (test, logger) {

  let methods = ['log', 'onLog', 'getLogById', 'count', 'getLatestLogs', 'getEarliestLogs', 'wipe', 'publish'];
  for (let propName of methods) {
    test.equal(typeof logger[propName], 'function', 'typeof .' + propName + ' is function');
  }

  // Create local scope.
  if (true) {
    // Basics - logging, fetching and counting.
    let oldLogCount = logger.count();
    test.equal(typeof oldLogCount, 'number', '.count() returns a number');

    let logCount = oldLogCount;
    logger.onLog(function (id) {
      logCount++;
    });
    let logContent = ['test'];
    let logId = logger.log.apply(logger, logContent);
    test.isNotUndefined(logId, '.log() returns an ID');
    test.equal(logCount - oldLogCount, 1, 'Log captured');
    test.equal(logCount, logger.count(), 'Log count correct');

    let fetchedLog = logger.getLogById(logId);
    test.isNotUndefined(fetchedLog, '.getLogById() returns something');
    test.equal(aryEqual(logContent, fetchedLog.content), true, '.getLogById() returns correct log content');
    let latestLogs = logger.getLatestLogs(1);
    test.isNotUndefined(latestLogs, '.latestLog() returns something');
    test.equal(latestLogs.length, 1, '.latestLog() returns correct amount of items');
    test.equal(aryEqual(logContent, latestLogs[0].content), true, '.latestLog() returns correct logs');
  }

  // Create local scope.
  if (true) {
    // Wipe test.
    logger.wipe();
    // Wipe would leave 1 log.
    test.equal(logger.count(), 1, 'Log wiped');
  }

  if (true) {
    logger.wipe();
    // Sort test.
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

    // There was a wipe log in the front.
    let earliestLogs = logger.getEarliestLogs(logContents.length + 1);
    // Get rid of the first log.
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
  }

  logger.wipe();
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
