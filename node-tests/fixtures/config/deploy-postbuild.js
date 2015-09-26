module.exports = function(environment) {
  var ENV = {};

  if (environment === 'development-postbuild') {
    ENV.pipeline = {
      activateOnDeploy: true
    };
  }

  return ENV;
};
