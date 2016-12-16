---
title: Configuration
---

By default, `ember-cli-deploy` expects a `deploy.js` file in the `config/` directory of your Ember-CLI project root. In this file you tell `ember-cli-deploy` about the necessary credentials for your file hoster and for your key-value store. An example could look like this:

```js
module.exports = {
  development: {
    buildEnv: 'development', // Override the environment passed to the ember asset build. Defaults to 'production'
    store: {
      type: 'redis', // the default store is 'redis'
      host: 'localhost',
      port: 6379
    },
    assets: {
      type: 's3', // default asset-adapter is 's3'
      gzip: false, // if undefined or set to true, files are gziped
      gzipExtensions: ['js', 'css', 'svg'], // if undefined, js, css & svg files are gziped
      exclude: ['.DS_Store', '*-test.js'], // defaults to empty array
      accessKeyId: '<your-access-key-goes-here>',
      secretAccessKey: process.env['AWS_ACCESS_KEY'],
      bucket: '<your-bucket-name>'
    }
  },

  staging: {
    buildEnv: 'staging', // Override the environment passed to the ember asset build. Defaults to 'production'
    store: {
      host: 'staging-redis.example.com',
      port: 6379
    },
    assets: {
      accessKeyId: '<your-access-key-goes-here>',
      secretAccessKey: process.env['AWS_ACCESS_KEY'],
      bucket: '<your-bucket-name>'
    },
    manifestPrefix: 'stage-app' // optional, defaults to this.project.name()
  },

   production: {
    store: {
      host: 'production-redis.example.com',
      port: 6379,
      password: '<your-redis-secret>'
    },
    assets: {
      accessKeyId: '<your-access-key-goes-here>',
      secretAccessKey: process.env['AWS_ACCESS_KEY'],
      bucket: '<your-bucket-name>'
    }
  }
};
```

You must have an entry for every environment you want to use in this file.
