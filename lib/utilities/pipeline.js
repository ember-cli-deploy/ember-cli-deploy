'use strict';

var Promise = require('rsvp').Promise;
var _       = require('lodash-node');

var chalk = require('chalk');
var blue  = chalk.blue;
var red   = chalk.red;
var grey  = chalk.grey;

function Pipeline(hookNames, options) {
  hookNames = hookNames || [];
  options = options || {};

  this._ui = options.ui;

  this._pipelineHooks = hookNames.reduce(function(pipelineHooks, hookName) {
    pipelineHooks[hookName] = [];

    return pipelineHooks;
  }, {});
}

Pipeline.prototype.register = function(hookName, fn) {
  var pipelineHooks = this._pipelineHooks;

  if (pipelineHooks[hookName]) {
    pipelineHooks[hookName].push(fn);
  }
};

Pipeline.prototype.execute = function(context) {
  context = context || { };

  var ui            = this._ui;
  var pipelineHooks = this._pipelineHooks;
  var hookNames     = Object.keys(pipelineHooks);

  ui.write(blue('Executing pipeline\n'));

  return hookNames.reduce(function(promise, hookName) {
    return promise
      .then(function(context) {
        ui.write(blue('  Hook: ' + hookName + '\n'));

        return context;
      })
      .then(this._executeHook.bind(this, hookName));
  }.bind(this), Promise.resolve(context))
    .then(function() {
      ui.write(blue('Pipeline complete\n'));
    })
    .catch(function(error) {
      ui.write(red('Pipeline aborted\n'));
      ui.write(grey('  Reason: ') + red(error) + '\n');
    });
};

Pipeline.prototype._executeHook = function(hookName, context) {
  var hookFunctions = this._pipelineHooks[hookName];

  return hookFunctions.reduce(function(promise, fn) {
    return promise
      .then(function(context) {
        return fn(context);
      })
      .then(function(result) {
        return _.merge(context, result);
      })
  }, Promise.resolve(context));
}

module.exports = Pipeline;
