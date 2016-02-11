EZLog for Meteor
================

This logging library lets you categorize logs by `component` and `topics`. Logs are stored in a private collection.

For example, you can have a logger for your REST interfaces that only tracks successful writes:
```JavaScript
const EZLogger = EZLog.DefaultLogger;
let restGoodWriteLogger = new EZLogger({
  "component": "REST",
  "topics": ["write", "good"]
});

function onSuccessfulWrite(id, meta) {
  // `logger.log` has the same signature as `console.log`.
  restGoodWriteLogger.log(id, meta);
}

// To retrieve the latest 10 logs:
restGoodWriteLogger.getLatestLogs(10);
```

You can also directly use `EZLog.DefaultLogger` without any configuration. The default `component` is `"default"` and the default `topics` is empty.
```JavaScript
const EZLogger = EZLog.DefaultLogger;

function onSuccessfulWrite(id, meta) {
  // `logger.log` has the same signature as `console.log`.
  EZLogger.log(id, meta);
}
```

As a shortcut, the apis on `EZLog.DefaultLogger` is mirrored onto the namespace `EZLog`. But you can't do `new EZLog()`.
```JavaScript
function onSuccessfulWrite(id, meta) {
  // `logger.log` has the same signature as `console.log`.
  EZLog.log(id, meta);
}

// Don't do this.
let logger = new EZLog(); // Will throw.
```

See [API.md](https://github.com/Zodiase/meteor-ezlog/blob/master/api.md) for more details.

## Install

### Use in App
```Bash
meteor add zodiase:ezlog
```

### Use in Package
In package.js:
```JavaScript
api.use('zodiase:ezlog@0.0.1');
```

## Examples

### Log and Get Logs All at either Client or Server Side
#### Client/Server
```JavaScript
let logger = new EZLog.DefaultLogger({
  "component": "some-module",
  "topics": ["error", "critical", "user"]
});

// Log something.
let logId = logger.log('foo', 'bar', 'whatever');

// Get log by Id.
let logDoc = logger.getLogById(logId);
console.log(logDoc.content);

// Get last 10 logs.
logger.getLatestLogs(10);
```

### Log at Server Side and Get Logs at Client Side.
#### Client
```JavaScript
let logger = new EZLog.DefaultLogger({
  "component": "some-module",
  "topics": ["error", "critical", "user"]
});

// Subscribe 100 latest logs.
logger.subscribe(100);

Tracker.autorun(function(comp) {
  // Get all 100 logs and keep them updated.
  logger.getLatestLogs(100);
});

// Callback for every new log.
logger.onLog(function(logId, logDoc) {
  // Captured log.
  console.log(logId, logDoc.content);
});
```

#### Server
```JavaScript
let logger = new EZLog.DefaultLogger({
  "component": "some-module",
  "topics": ["error", "critical", "user"]
});

// Publish logs.
logger.publish();

// Log something.
logger.log('foo', 'bar', 'whatever');
```

### Log at Client Side and Get Logs at Server Side.
#### Client
```JavaScript
let logger = new EZLog.DefaultLogger({
  "component": "some-module",
  "topics": ["error", "critical", "user"]
});

// Log something.
logger.log('foo', 'bar', 'whatever');
```

#### Server
```JavaScript
let logger = new EZLog.DefaultLogger({
  "component": "some-module",
  "topics": ["error", "critical", "user"]
});

// Callback for every new log.
logger.onLog(function(logId, logDoc) {
  // Captured log.
  console.log(logId, logDoc.content);
});
```
