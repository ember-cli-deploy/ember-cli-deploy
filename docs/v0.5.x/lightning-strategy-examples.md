---
title: Lightning Strategy Examples
---

## End-to-end Example

[Ember-deploy-demo](https://github.com/ghedamat/ember-deploy-demo) demonstrates a complete ember-cli-deploy setup.

It uses:

* [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack) plugin pack as base
* [`ember-cli-deploy-ssh-tunnel`](https://github.com/ember-cli-deploy/ember-cli-deploy-ssh-tunnel) to connect to the redis instance on the server
* the [development workflow](../development-workflow)
* a [Ruby on Rails backend](https://github.com/ghedamat/ember-deploy-demo/tree/master/edd-rails) that serves the app ([fetching from redis example](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-rails/app/controllers/demo_controller.rb))

You can take inspiration from these files:

* [`config/deploy.js`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/config/deploy.js)
* [`ember-cli-build.js`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/ember-cli-build.js)
* [`.env.deploy.production`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/.env.deploy.production.example)
* [`package.json`](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/package.json#L33-L34)

## Example Sinatra app

This is a small sinatra application that can be used to serve an Ember-CLI application deployed with [`ember-cli-deploy-lightning-pack`](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack).

```ruby
require 'sinatra'
require 'redis'

get '/' do
  content_type 'text/html'

  redis = Redis.new
  project = "<your-project-name>"
  index_key = params[:index_key] || redis.get("#{project}:index:current")
  redis.get("#{project}:index:#{index_key}")
end
```

The nice thing about this is that you can deploy your app to production, test it out by passing an index_key parameter with the revision you want to test and activate when you feel confident that everything is working as expected.

## Example Node app (outdated)

This app does the same as the *Sinatra app* above, it supports the same index_key query param. It should help you to get up and running in seconds and dont worry about server code. You also need to deploy your ember app with `ember-cli-deploy` and `ember-deploy-redis`.

[Nodejs example with one click deploy!](https://github.com/philipheinser/ember-lightning)

## Azure Tables Server apps

- C#-based, https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756
- Node.js-based, [node-ember-cli-deploy-azure-tables](https://github.com/jamesdixon/node-ember-cli-deploy-azure-tables) courtesy of [jamesdixon](https://github.com/jamesdixon/)
