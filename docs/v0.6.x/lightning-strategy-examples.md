---
title: Lightning Strategy Examples
---

## End-to-end Example

[`Ember Deploy Demo`](https://github.com/ghedamat/ember-deploy-demo) demonstrates a complete Ember CLI Deploy setup.

It uses:

* [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack) plugin pack as base
* [`ember-cli-deploy-ssh-tunnel`](https://github.com/ember-cli-deploy/ember-cli-deploy-ssh-tunnel) to connect to the Redis instance on the server
* The [development workflow](../development-workflow)
* A [Ruby on Rails backend](https://github.com/ghedamat/ember-deploy-demo/tree/master/edd-rails) that serves the app ([fetching from Redis example](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-rails/app/controllers/demo_controller.rb))

You can take inspiration from these files:

* [`config/deploy.js`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/config/deploy.js)
* [`ember-cli-build.js`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/ember-cli-build.js)
* [`.env.deploy.production`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/.env.deploy.production.example)
* [`package.json`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/package.json#L33-L34)

## Example Sinatra app

This is a small Sinatra application, that can be used to serve an Ember CLI application deployed with [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack).

```ruby
require 'sinatra'
require 'redis'

get '/' do
  content_type 'text/html'

  redis = Redis.new
  project = '<your-project-name>'
  index_key = params[:index_key] || redis.get("#{project}:index:current")
  redis.get("#{project}:index:#{index_key}")
end
```

The nice thing about this is that you can deploy your application to production, test it out by passing an `index_key` parameter with the revision you want to test and activate when you feel confident that everything is working as expected.

### [`ember-cli-deploy-rack`](https://github.com/bitaculous/ember-cli-deploy-rack)

Alternatively, you can use [`ember-cli-deploy-rack`](https://github.com/bitaculous/ember-cli-deploy-rack), which bundles the described functionality in the Sinatra application as a gem.

## Example Node apps

### Using [Koa](http://koajs.com)

This app does the same as the *Sinatra app* above, it supports the same index_key query param. It should help you to get up and running in seconds and dont worry about server code. This needs your Ember-CLI app to be deployed with [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack).

[Nodejs example with one click Heroku deploy!](https://github.com/philipheinser/ember-lightning)

### Using ExpressJS

This app is very similar to the *Sinatra app* above but also implements a very simple `/revisions` endpoint where you can see all current revisions available to use. It is implemented using [Express](http://expressjs.com/) so should be very easy to follow. This needs your Ember-CLI app to be deployed with [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack).

[Simple NodeJS example](https://github.com/stonecircle/express-lightning-deploy)

## Azure Tables Server apps

- C#-based, https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756
- Node.js-based, [node-ember-cli-deploy-azure-tables](https://github.com/jamesdixon/node-ember-cli-deploy-azure-tables) courtesy of [jamesdixon](https://github.com/jamesdixon)
