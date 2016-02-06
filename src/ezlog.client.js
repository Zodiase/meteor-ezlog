const {
  logCollection,
  indexes,
  createMirror
} = helpers;

logCollection.allow({
  'insert': function (userId, doc) {
    return true;
  },
  'update': function (userId, doc, fieldNames, modifier) {
    return false;
  },
  'remove': function (userId, doc) {
    return false;
  }
});

logCollection.deny({
  'insert': function (userId, doc) {
    return false;
  },
  'update': function (userId, doc, fieldNames, modifier) {
    return true;
  },
  'remove': function (userId, doc) {
    return true;
  }
});

EZLog.DefaultLogger = DefaultLogger;

createMirror(EZLog.DefaultLogger, EZLog);
