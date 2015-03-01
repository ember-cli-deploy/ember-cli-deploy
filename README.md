# ember-cli-deploy [![Build Status](https://travis-ci.org/ember-cli/ember-cli-deploy.svg?branch=master)](https://travis-ci.org/ember-cli/ember-cli-deploy) [![Code Climate](https://codeclimate.com/github/ember-cli/ember-cli-deploy/badges/gpa.svg)](https://codeclimate.com/github/ember-cli/ember-cli-deploy)

> A deployment pipeline for Ember CLI apps.

This project provides a plugin based pipeline for easy deployment of Ember CLI based applications. By registering an ember-cli-deploy compatible plugin, users can hook in to the pipeline at specific points to control things such as, but not limited to, builds, uploading of assets and post deployment notifications.

## Installation

Simply run:

```
ember install:addon ember-cli-deploy
```

## Configuration

Configuration is supplied to ember-cli-deploy via a configuration file.  By default, this file should be called `deploy.js` and should be located in the `config` directory in the root of your Ember CLI project.

Alternatively, you can specify a different file location by passing the `deploy-config-file` option to the `ember deploy` command.

An example of the configuration file is as follows:

```javascript
// config/deploy.js
module.exports = {
}
```

## Commands

ember-cli-deploy adds the following deployment commands to Ember CLI:

- `ember deploy` Initiates the deployment pipeline, invoking any registered ember-cli-deploy plugins at the defined hook points

## Deployment lifecycle

### Hooks

## Plugins

### Plugin architecture

### Default plugins
