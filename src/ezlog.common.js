const namespace = 'zodiase:ezlog/';
const logCollection = new Mongo.Collection(namespace + 'logs');

const indexes = {
  'createdAt': 1,
  'logger': 1,
  'component': 'text',
  'topics': 1,
};

const NOOP = function (result) {return result};

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
};

const mirroredProperties = [
  'log',
  'onLog',
  'getLogById',
  'count',
  'getLatestLogs',
  'getEarliestLogs',
  'wipe',
  'publish',
  'subscribe'
];
const createMirror = function (source, target) {
  for (let propName of mirroredProperties) {
    target[propName] = source[propName];
  }
};


EZLog = function () {
  // Should not be used as a constructor.
  if (this instanceof EZLog) {
    throw new Error('EZLog can not be used as a constructor. Call directly instead.');
  }
};

helpers = {
  namespace,
  logCollection,
  indexes,
  NOOP,
  verifyLogContent,
  makeArray,
  sliceArguments,
  createMirror
};
