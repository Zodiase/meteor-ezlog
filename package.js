Package.describe({
  name: 'zodiase:ezlog',
  version: '0.0.1',
  summary: 'A simple logger for meteor.',
  git: 'https://github.com/Zodiase/meteor-ezlog.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'ecmascript',
    'check',
    'ejson',
    'mongo',
    'zodiase:check@0.0.4'
  ]);
  api.export('EZLog', ['client', 'server']);
  api.addFiles([
    'src/ezlog.common.js',
    'src/DefaultLogger.js'
  ], ['client', 'server']);
  api.addFiles('src/ezlog.client.js', 'client');
  api.addFiles('src/ezlog.server.js', 'server');
});

Npm.depends({
  "phantomjs-polyfill": "0.0.1"
});

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'ejson',
    'tinytest',
    'zodiase:ezlog'
  ]);
  api.use('tracker', 'client');
  // PhantomJS doesn't have Function.prototype.bind.
  api.addFiles('polyfill/function-bind.js', ['client', 'server']);
  api.addFiles('tests/common.js', ['client', 'server']);
});
