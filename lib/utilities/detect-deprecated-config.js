var path = require('path');
var glob = require('glob');

module.exports = function() {
  var deprecatedConfigPath = path.join(__dirname, '../../../..', 'config', 'deploy', '*.js');
  var files = glob.sync(deprecatedConfigPath);
  return files.length > 0;
};
