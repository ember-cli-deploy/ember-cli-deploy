'use strict';

var Promise = require('rsvp').Promise;
var _       = require('lodash-node');

function Pipeline(hookNames) {
  hookNames = hookNames || [];

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

  var pipelineHooks = this._pipelineHooks;
  var hookNames     = Object.keys(pipelineHooks);

  return hookNames.reduce(function(promise, hookName) {
    return promise.then(this._executeHook.bind(this, hookName));
  }.bind(this), Promise.resolve(context));
};

Pipeline.prototype._executeHook = function(hookName, context) {
  var hookFunctions = this._pipelineHooks[hookName];

  return hookFunctions.reduce(function(promise, fn) {
    return promise
      .then(function(context) {
        return fn(_.cloneDeep(context));
      })
      .then(function(result) {
        return _.merge(result, context);
      })
  }, Promise.resolve(context));
}

module.exports = Pipeline;
