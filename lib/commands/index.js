var buildDiscontinuedCommand = require('./discontinued-command');

module.exports = {
  'deploy': require('./deploy'),
  'deploy:activate': require('./activate'),
  'deploy:list': require('./list'),

  'deploy:assets': buildDiscontinuedCommand('deploy:assets', 'deploy assets'),
  'deploy:index': buildDiscontinuedCommand('deploy:assets', 'deploy index'),
  'deploy:versions': buildDiscontinuedCommand('deploy:assets', 'list versions')
};
