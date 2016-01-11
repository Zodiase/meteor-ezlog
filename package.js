Package.describe({
  name: 'zodiase:ezlog',
  version: '0.0.1',
  summary: 'A simple logger for meteor.',
  git: 'https://github.com/Zodiase/meteor-ezlog.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('check');
  api.use('ejson');
  api.use('mongo');
  api.export('EZLog', ['client', 'server']);
  api.addFiles('src/ezlog.client.js', 'client');
  api.addFiles('src/ezlog.server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('zodiase:ezlog');
  api.addFiles('tests/client.js', 'client');
  api.addFiles('tests/server.js', 'server');
});
