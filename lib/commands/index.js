module.exports = {
  "deploy": require('./deploy'),
  "deploy:activate": require('./activate'),
  "deploy:list": require('./list'),

  "deploy:assets": require('./unsupported/assets'),
  "deploy:index": require('./unsupported/deploy-index'),
  "activate": require('./unsupported/activate'),
  "deploy:versions": require('./unsupported/versions')
};
