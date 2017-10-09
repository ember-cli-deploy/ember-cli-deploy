var lint = require('mocha-eslint');
lint([
  'node-tests',
  'lib',
  'bin',
  'index.js',
  'blueprints'
])
