module.exports = function(environment) {
  var ENV = {};

  if (environment === 'development') {
    ENV.build = {
      environment: 'development'
    };

    ENV.s3 = {
      bucket: 'shineonyoucrazy',
      region: 'us-east-1'
    };
  }

  if (environment === 'staging') {
    ENV.build = {
      environment: 'production'
    };

    ENV.s3 = {
      bucket: 'keepitreal',
      region: 'us-east-1'
    };
  }

  return ENV;
};
