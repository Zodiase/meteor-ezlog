Package.describe({
  name: 'zodiase:ezlog',
  version: '0.0.2',
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

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'ejson',
    'tinytest',
    'zodiase:function-bind@0.0.1', // Polyfill for PhantomJS.
    'zodiase:ezlog'
  ]);
  api.use('tracker', 'client');
  api.addFiles('tests/common.js', ['client', 'server']);
});
