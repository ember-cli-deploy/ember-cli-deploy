module.exports = {
  "deploy": require('./deploy'),
  "deploy:activate": require('./activate'),
  "deploy:list": require('./list'),

  "deploy:assets": require('./deprecated/assets'),
  "deploy:index": require('./deprecated/deploy-index'),
  "activate": require('./deprecated/activate'),
  "deploy:versions": require('./deprecated/versions')
};
