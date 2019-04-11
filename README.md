# Ember CLI Deploy
[![Build Status](https://travis-ci.org/ember-cli-deploy/ember-cli-deploy.svg?branch=master)](https://travis-ci.org/ember-cli-deploy/ember-cli-deploy) [![Code Climate](https://codeclimate.com/github/ember-cli-deploy/ember-cli-deploy/badges/gpa.svg)](https://codeclimate.com/github/ember-cli-deploy/ember-cli-deploy)

Simple, flexible deployment for your Ember CLI app

## Installation

```
ember install ember-cli-deploy
```
## Quick start

After installation, choose [plugins](http://ember-cli-deploy.com/plugins/) matching your deployment environment, [configure](http://ember-cli-deploy.com/docs/v1.0.x/configuration/) your deployment script appropriately and you're ready to [start deploying](http://ember-cli-deploy.com/docs/v1.0.x/usage/).

## In-depth documentation

[Visit the Docs site](http://ember-cli-deploy.com/docs/v1.0.x/)

## Contributing

Clone the repo and run `npm install`. To run tests,

    npm test

To run the documentation site locally, see the [Github Pages docs](https://help.github.com/en/articles/setting-up-your-github-pages-site-locally-with-jekyll) or if you know you already have a working modern ruby and bundler setup, this should do it:

```
cd docs
bundle install
bundle exec jekyll serve
```
