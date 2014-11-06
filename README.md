# Ember-deploy

An Ember-CLI Addon for `Lightning Fast Deployments of Ember-CLI Apps`

This project includes the necessary commands for 'Lightning Fast Deployments of
Ember-CLI Apps'. The whole workflow is heavily inspired by Luke Melia's talk
about [Lightning Fast Deployment(s) of Rails-backed Javascript Apps](https://www.youtube.com/watch?v=QZVYP3cPcWQ).

## Workflow

__Please watch Luke's Talk before using this project!__

The TL;DR of the talk is that you want to serve your bootstrap index.html that Ember-CLI builds for you from a Key-Value store via your Backend and serve the rest of your assets from a static file hoster like for example [S3](https://aws.amazon.com/de/s3/). This is a sketch of what this Addon gives you ripped out of Luke's talk slides:

![Workflow](https://dl.dropboxusercontent.com/s/d92gi00hzesov0z/Bildschirmfoto%202014-10-30%20um%2021.02.19.png?dl=0)

A deployment consists of multiple steps:

1. Build your assets for production via `ember build --environment production`
2. Upload assets to S3.
3. Upload your bootstrap index.html to a key-value store.
4. Activate the uploaded index.html as the default revision your users will get served from your backend.

## Installation

Simply run

```
npm install ember-deploy --save-dev
```

and the new commands will be available in your ember-cli app!

## Commands

This Ember-CLI Addon adds multiple deployment related tasks to your Ember-CLI App.

* `ember deploy:assets` Uploads your production assets to a static file hoster. Currently only S3 is supported.
* `ember deploy:index` Uploads a bootstrap index.html to a key-value store. Currently only redis is supported.
* `ember deploy:list` Lists all currently uploaded `revisions` of bootstrap index.html files in your key-value store.
* `ember deploy:activate` Activates an uploaded `revision`. This will set the `<your-project-name>:current` revision to the passed revision. `<your-project-name>:current` is the revision you will serve your users as default.
* `ember deploy` This commands builds your ember application, uploads it to your file hoster and uploads it to your key value store in one step.

You can pass `--environment <some-environment>` to every command. If you don't pass an environment explicitly `ember-deploy` will use the `development`-environment.

## Config file

`ember-deploy` expects a `deploy.json` file in the root of your Ember-CLI app directory. In this file you tell `ember-deploy` about the necessary credentials for your file hoster and for your key-value store. An Example could look like this:

```json
{
  "development": {
    "store": {
      "host": "localhost",
      "port": 6379
    },
    "assets": {
      "accessKeyId": "<your-access-key-goes-here>",
      "secretAccessKey": "<your-secret-access-key-goes-here>",
      "bucket": "<your-bucket-name>"
    }
  },

  "staging": {
    "store": {
      "host": "staging-redis.example.com",
      "port": 6379
    },
    "assets": {
      "accessKeyId": "<your-access-key-goes-here>",
      "secretAccessKey": "<your-secret-access-key-goes-here>",
      "bucket": "<your-bucket-name>"
    }
  }
}
```

You have to have an entry for every environment you want to use in this file.

## How to use

This is an example of how one would use this addon to deploy an ember-cli app:

* `ember deploy --environment production`
* `ember deploy:list --environment production` (this will print out a list of revisions)
* `ember deploy:activate --revision ember-deploy:44f2f92 --environment production `

## Asset uploads

`ember-deploy` sets the correct cache headers for you. Currently these are hard coded to a two year cache period. Assets are also gzipped before uploading to S3. This should be enough to cache aggressively and you should not run into problems due to ember-cli's fingerprinting support. I will try to add more configuration options for caching in the near future.

## Tooling
`ember-deploy` is pretty opinionated right now. It only supports [redis](http://redis.io/) as its key-value store and expects you to use [S3](https://aws.amazon.com/de/s3/) for hosting your assets.

Internally `ember-deploy` uses my [deployinator](https://github.com/LevelbossMike/deployinator) project to upload to a key-value store. Deployinator is built around the idea of adapters which should make it easy to add other key-value stores if you have the need for them. 

S3 as a hosting provider is built into `ember-deploy` itself but this also should be changed to some kind of adapter in the near future. Unfortunately right now you will need to use S3.

### Example Sinatra app

This is a small sinatra application that can be used to serve an Ember-CLI application deployed with the help of `ember-deploy`. 

```ruby
require 'sinatra'  
require 'redis'

def bootstrap_index(index_key)  
  redis = Redis.new
  index_key ||= redis.get('<your-project-name>:current')
  redis.get(index_key)
end

get '/' do  
  content_type 'text/html'
  bootstrap_index(params[:index_key])
end  
```

The nice thing about this is that you can deploy your app to production, test it out by passing an index_key parameter with the revision you want to test and activate when you feel confident that everything is working as expected.

### Developing

Clone the repo and run `npm install`. To run tests,

    npm test
