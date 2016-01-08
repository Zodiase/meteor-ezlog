Tinytest.add('EZLog basics', function (test) {

  test.equal(typeof EZLog, 'function', 'typeof EZLog is function');
  // Can not use EZLog as a constructor.
  test.throws(function () {
    let logger = new EZLog();
  });

});

Tinytest.add('EZLog.DefaultLogger class', function (test) {

  test.equal(typeof EZLog.DefaultLogger, 'function',
    'typeof EZLog.DefaultLogger is function');
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

  test.equal(EZLog.log, EZLog.DefaultLogger.log,
    'EZLog.log mirrors EZLog.DefaultLogger.log');
  test.equal(EZLog.onLog, EZLog.DefaultLogger.onLog,
    'EZLog.onLog mirrors EZLog.DefaultLogger.onLog');
  test.equal(EZLog.getLogById, EZLog.DefaultLogger.getLogById,
    'EZLog.getLogById mirrors EZLog.DefaultLogger.getLogById');
  testBasicAPIs(test, EZLog);

});

function testBasicAPIs (test, logger) {

  test.equal(typeof logger.log, 'function', 'typeof .log is function');
  test.equal(typeof logger.onLog, 'function', 'typeof .onLog is function');
  test.equal(typeof logger.getLogById, 'function', 'typeof .getLogById is function');

  let logCount = 0;
  logger.onLog(function (id) {
    logCount++;
  });
  let logContent = ['test'];
  let logId = logger.log.apply(logger, logContent);
  test.isNotUndefined(logId, '.log() returns an ID');
  test.equal(logCount, 1, 'Log captured');
  let fetchedLog = logger.getLogById(logId);
  test.isNotUndefined(fetchedLog, '.getLogById() returns something');
  test.equal(logContent, fetchedLog.content, '.getLogById() returns correct log content');

}
