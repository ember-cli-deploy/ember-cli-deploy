'use strict';

var Promise = require('ember-cli/lib/ext/promise');
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
  var ui            = this._ui;
  var pipelineHooks = this._pipelineHooks;

  if (typeof fn === 'function') {
    fn = {
      name: 'anonymous function',
      fn: fn
    };
  }

  ui.write(blue('Registering hook -> ' + hookName + '[' + fn.name + ']\n'));

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
        ui.write(blue('|\n'));
        ui.write(blue('+- ' + hookName + '\n'));

        return context;
      })
      .then(this._executeHook.bind(this, hookName));
  }.bind(this), Promise.resolve(context))
    .then(function() {
      ui.write(blue('|\n'));
      ui.write(blue('Pipeline complete\n'));
    })
    .catch(function(error) {
      ui.write(blue('|\n'));
      ui.write(red('Pipeline aborted\n'));
      return Promise.reject();
    });
};

Pipeline.prototype._executeHook = function(hookName, context) {
  var ui            = this._ui;
  var hookFunctions = this._pipelineHooks[hookName];

  return hookFunctions.reduce(function(promise, fnObject) {
    return promise
      .then(function(context) {
        ui.write(blue('|  |\n'));
        ui.write(blue('|  +- ' + fnObject.name + '\n'));
        return fnObject.fn(context);
      })
      .then(function(result) {
        return _.merge(context, result, function(a, b) {
          if (_.isArray(a)) {
            return a.concat(b);
          }
        });
      })
  }, Promise.resolve(context));
}

module.exports = Pipeline;
