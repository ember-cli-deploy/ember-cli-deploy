module.exports = function(environment) {
  var ENV = {};

  if (environment === 'development') {
    ENV.build = {
      environment: 'development'
    };

    ENV.s3 = {
      bucket: 'testsdummyconfig',
      region: 'us-east-1'
    };
  }

  return ENV;
};
