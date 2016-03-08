Tinytest.add('EZLog.createContext', function (test) {
  test.equal(typeof EZLog.createContext, 'function', 'typeof EZLog.createContext is not function');
});

Tinytest.add('EZLog.createContext without title', function (test) {
  const ctx = EZLog.createContext();
  test.equal(typeof ctx, 'object', 'typeof ctx is not object');
});

Tinytest.add('Context properties', function (test) {
  const ctx = EZLog.createContext();
  test.isNotUndefined(ctx.id, 'ID not defined');
  test.equal(typeof ctx.log, 'function', 'typeof ctx.log is not function');
  test.equal(typeof ctx.count, 'function', 'typeof ctx.count is not function');
  test.equal(typeof ctx.findLog, 'function', 'typeof ctx.findLog is not function');
  test.equal(typeof ctx.fetchLogs, 'function', 'typeof ctx.fetchLogs is not function');
  test.equal(typeof ctx.seal, 'function', 'typeof ctx.seal is not function');
});

Tinytest.add('EZLog.getContextById', function (test) {
  const ctx = EZLog.createContext();
  test.equal(ctx, EZLog.getContextById(ctx.id), 'EZLog.getContextById does not return correct data');
});

Tinytest.add('Context.log', function (test) {
  const ctx = EZLog.createContext();
  const logId = ctx.log('a', 'b', 'c');
  test.isNotUndefined(logId, 'ID not defined');
  const log = ctx.findLog(logId);
  test.isNotUndefined(log, 'Log not defined');
});
