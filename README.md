# ember-cli-deploy [![Build Status](https://travis-ci.org/ember-cli/ember-cli-deploy.svg?branch=master)](https://travis-ci.org/ember-cli/ember-cli-deploy) [![Code Climate](https://codeclimate.com/github/ember-cli/ember-cli-deploy/badges/gpa.svg)](https://codeclimate.com/github/ember-cli/ember-cli-deploy)

An Ember-CLI Addon for `Lightning Fast Deployments of Ember-CLI Apps`

This project includes the necessary commands for 'Lightning Fast Deployments of
Ember-CLI Apps'. The whole workflow is heavily inspired by Luke Melia's talk
about [Lightning Fast Deployment(s) of Rails-backed Javascript Apps](https://www.youtube.com/watch?v=QZVYP3cPcWQ).

`ember-cli-deploy` aims to be the go-to-solution for deploying all Ember-CLI apps thus it also supports other types of deployments that differ from the one Luke suggests. Please see this README's subsection about [custom adapters](#custom-adapters) on how to get started with your own deployment strategy with `ember-cli-deploy`.

You can also have a look on how to use this ember-cli addon in the following video of a talk about `ember-cli-deploy` [Ben Limmer](https://github.com/blimmer) gave at [Ember.js-Denver](http://www.meetup.com/Ember-js-Denver/).

<a href="https://www.youtube.com/watch?v=MT0LKcVh6Rw&t=1m55s" target="_blank">![ember-deploy talk](http://i.imgur.com/dOGvXty.png)</a>

## Installation

Simply run

```
npm install ember-cli-deploy --save-dev
```

and the new commands will be available in your ember-cli app!

## Commands

This Ember-CLI Addon adds multiple deployment related tasks to your Ember-CLI App.

* `ember deploy:assets` Uploads your production assets to a static file hoster.
* `ember deploy:index` Uploads a bootstrap index.html to a key-value store.
* `ember deploy:list` Lists all currently uploaded `revisions` of bootstrap index.html files in your key-value store.
* `ember deploy:activate` Activates an uploaded `revision`. This will set the `<your-project-name>:current` revision to the passed revision. `<your-project-name>:current` is the revision you will serve your users as default.
* `ember deploy` This commands builds your ember application, uploads it to your file hoster and uploads it to your key value store in one step.

You can pass `--environment <some-environment>` to every command. If you don't pass an environment explicitly `ember-cli-deploy` will use the `development`-environment.

You can pass `--deploy-config-file <path/to/deploy-config.js>` to every command. If you don't pass a deploy-config-file explicitly `config/deploy.js` will be read.

## Lightning-Approach Workflow

`ember-cli-deploy` is built around the idea of adapters for custom deployment strategies but for most people the approach Luke suggest in his talk will be a perfect fit.

To use the Lightning-Approach workflow from Luke's talk you will also need to install the redis- and s3-adapters for `ember-cli-deploy`:

```
npm install ember-deploy-redis ember-deploy-s3 --save-dev
```

[__Please watch Luke's Talk before using this project!__](https://www.youtube.com/watch?v=QZVYP3cPcWQ)

The TL;DR of the talk is that you want to serve your bootstrap index.html that Ember-CLI builds for you from a Key-Value store via your Backend and serve the rest of your assets from a static file hoster like for example [S3](https://aws.amazon.com/de/s3/). This is a sketch of what this Addon gives you out of the box:

![Workflow](https://dl.dropboxusercontent.com/s/tun9kbr4eyrcama/ember-deploy.png?dl=0)

A deployment consists of multiple steps:

1. Build your assets for production via `ember build --environment production`
2. Upload assets to S3.
3. Upload your bootstrap index.html to a key-value store.
4. Activate the uploaded index.html as the default revision your users will get served from your backend.

If you don't install the redis- and s3-adapters you will need to use a custom adapter you or the community have written. Please have a look at the Custom-Adapters section of this README for further information. In essence your custom adapters will implement the same steps as for the Lightning-Approach but you can customize the different steps as you see fit.

## Config file

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

## How to use

This is an example of how one would use this addon to deploy an ember-cli app:

* `ember deploy --environment production`
* `ember deploy:list --environment production` (this will print out a list of revisions)
* `ember deploy:activate --revision ember-deploy:44f2f92 --environment production `

## Fingerprinting Options / Staging environments

`ember-cli` comes with [fingerprinting
support](http://www.ember-cli.com/#fingerprinting-and-cdn-urls) built-in. In
most production scenarios you will need to provide a `prepend`-property to your
app's fingerprint-property (to reference your CDN served assets correctly).

```javascript
// Brocfile.js
var app = new EmberApp({
  fingerprint: {
    prepend: 'https://subdomain.cloudfront.net/'
  }
});
```

`ember-cli` will only create a production like build for the
`production`-environment by default. If you want to support multiple
'production-like' environments you need to configure minification for these
environments manually. You can do someting like this:

```javascript
// Brocfile.js
var env = EmberApp.env();
var isProductionLikeBuild = ['production', 'staging'].indexOf(env) > -1;

var app = new EmberApp({
  fingerprint: {
    enabled: isProductionLikeBuild,
    prepend: 'https://subdomain.cloudfront.net/'
  },
  sourcemaps: {
    enabled: !isProductionLikeBuild,
  },
  minifyCSS: { enabled: isProductionLikeBuild },
  minifyJS: { enabled: isProductionLikeBuild },

  tests: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
  hinting: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,

  vendorFiles: {
    'handlebars.js': {
      staging:  'bower_components/handlebars/handlebars.runtime.js'
    },
    'ember.js': {
      staging:  'bower_components/ember/ember.prod.js'
    }
  }
});
```

## S3-Asset uploads

`ember-deploy-s3` sets the correct cache headers for you. Currently these are hard coded to a two year cache period. Assets are also gzipped before uploading to S3. This should be enough to cache aggressively and you should not run into problems due to ember-cli's fingerprinting support. I will try to add more configuration options for caching in the near future.

### Example Sinatra app

This is a small sinatra application that can be used to serve an Ember-CLI application deployed with the help of `ember-cli-deploy` and `ember-deploy-redis`.

```ruby
require 'sinatra'
require 'redis'

def bootstrap_index(index_key)
  redis = Redis.new
  index_key &&= "<your-project-name>:#{index_key}"
  index_key ||= redis.get("<your-project-name>:current")
  redis.get(index_key)
end

get '/' do
  content_type 'text/html'
  bootstrap_index(params[:index_key])
end
```

The nice thing about this is that you can deploy your app to production, test it out by passing an index_key parameter with the revision you want to test and activate when you feel confident that everything is working as expected.

### Example nodejs app

This app does the same as the *Sinatra app* from before, it supports the same index_key query param. It should help you to get up and running in seconds and dont worry about server code. You also need to deploy your ember app with `ember-cli-deploy` and `ember-deploy-redis`.

[Nodejs example with one click deploy!](https://github.com/philipheinser/ember-lightning)

## Custom Adapters

`ember-cli-deploy` is built around the idea of adapters for the bootstrap-index- and the assets-uploads. For `ember-cli-deploy` to give you the deployment approach Luke talks about in his talk you will for example need to install the `ember-deploy-redis` and `ember-deploy-s3` adapters via npm.

Because `ember-cli-deploy` is built with adapters in mind you can write your own adapters for your project specific use cases.

Custom Adapters can be integrated via custom [Ember-CLI-Addons](http://www.ember-cli.com/#developing-addons-and-blueprints). For `ember-cli-deploy` to integrate your custom adapter addons you have to define your addon-type as an `ember-deploy-addon`.

You can have a look at [ember-deploy-s3](https://github.com/LevelbossMike/ember-deploy-s3) and [ember-deploy-redis](https://github.com/LevelbossMike/ember-deploy-redis) to get an idea how one would implement 'real-world'-adapters.

For the sake of clarity here's a quick example of how you will structure your addon to add custom adapters.

```js
//index.js in your custom addon

var SuperAwesomeCustomIndexAdapter = require('./lib/index-adapter');

function EmberDeploySuperAwesome() {
  this.name = 'ember-deploy-super-awesome';
  this.type = 'ember-deploy-addon';

  // ember-cli-deploy will merge ember-deploy-addon's adapters property
  this.adapters = {
    index: {
      'super-awesome': SuperAwesomeCustomIndexAdapter
    },
    assets: {
      // you can add multiple adapters in one ember-deploy-addon
    },

    tagging: {
      // you can add multiple adapters in one ember-deploy-addon
    }
  };
}

module.exports = EmberDeploySuperAwesome;
```

Because `ember-cli-deploy` will simply merge an `ember-deploy-addon`'s adapters property into its own bundled adapter-registry you could in theory bundle a complete new approach for deploying in one addon (just add an index- and an asset-adapter).

After adding your custom ember-deploy-addon to your project as an ember-cli-addon you can then use your custom adapters in ember-cli-deploy's deploy.json:

```js
{
  "development": {
    "store": {
      "type": "super-awesome",
      // .. whatever additional config your adapter needs
    },
    "assets": {
      "accessKeyId": "<your-access-key-goes-here>",
      "secretAccessKey": "<your-secret-access-key-goes-here>",
      "bucket": "<your-bucket-name>"
    }
  },
  //...
}
```

### Existing Custom Adapters
The following adapters have already been developed:
* [ember-deploy-redis](https://github.com/LevelbossMike/ember-deploy-redis), index-adapter for [Redis](http://redis.io)
* [ember-deploy-s3](https://github.com/LevelbossMike/ember-deploy-s3), assets-adapter for AWS [S3](http://aws.amazon.com/s3/)
* [ember-deploy-s3-index](https://github.com/Kerry350/ember-deploy-s3-index), index-adapter for AWS [S3](http://aws.amazon.com/s3/)
* [ember-deploy-azure](https://github.com/duizendnegen/ember-deploy-azure), index-adapter and assets-adapter for Azure Tables & Blob Storage respectively
* [ember-deploy-couchbase](https://github.com/waltznetworks/ember-deploy-couchbase), index-adapter for [Couchbase](http://www.couchbase.com)
* [ember-deploy-rest-index](https://github.com/leojh/ember-deploy-rest-index), index-adapter for REST API backends

### Index-Adapters

`index-adapters` take care of publishing bootstrap-index html that ember-cli builds for you. If you don't want to use `redis` as a key-value store for your index.html files if you are using the Lightning approach from Luke Melia's talk you could for example create a `cassandra`-adapter to use [Apacha Cassandra](http://cassandra.apache.org/) instead.

Index adapters have to implement the following methods for `ember-cli-deploy` to be able to use them:

####`upload([bootstrapIndexHTML])`

  __Parameters__

  _bootstrapIndexHTML_

  `upload` will get passed the content of `dist/index.html` that gets build from ember-cli. Feel free to do whatever you need to do with its file content.

  This method has to return a `RSVP.Promise`.

####`activate([revisionToActivate])`

__Parameters__

_revisionToActivate_

`activate` takes a revision you pass to it and activates it in the key-value store. The `redis`-adapter for example takes the passed revision-key and sets it as the value of the `<project.name>:current`-key in redis. Of course you can do whatever you want in this method. If you decide that you don't need a notion of activating revisions it is recommended that you nevertheless return a useful message to the user in this method.

This method has to return a `RSVP.Promise`.

####`list`

`list` lists all uploaded revisions you have deployed and that you want the user to be able to preview or to rollback to. Of course you can do whatever you want in this method. If you decide that you don't need a notion of listing revisions it is recommended that you nevertheless return a useful message to the user in this method.

This method has to return a `RSVP.Promise`.

### Asset-Adapters

`asset-adapters` take care of publishing your project assets. In the default use case (Luke Melia's lightning approach) your assets will be published to a static asset server like AWS S3. If you want to use some other static asset server service or you want to do something entirely different you can write your own `asset-adapter`. Asset-Adapters have to implement the following method for ember-cli-deploy to know what to do:

####`upload`

Ember deploy will gzip your `js` and `css` assets and copy these gzipped assets and all other assets from ember-cli's `dist`-folder to the `tmp/assets-sync`-directory. You can do whatever you want in an `asset-adapter`'s `upload`-method but most likely you will upload these assets to some kind of static-asset server with the `upload`-method.

This method has to return a `RSVP.Promise`.

### Tagging-Adapters

`tagging-adapters` take care of tagging revisions when uploading revisions via the `deploy-index`-command. `ember-cli-deploy` comes bundled with the `sha`-tagging-adapter that will tag your revisions according to the current git-sha.

Tagging Adapters need to implement the following method for ember-cli-deploy to know what to do:

####`createTag`

This method has to return a `String`.

### Contributing

Clone the repo and run `npm install`. To run tests,

    npm test
