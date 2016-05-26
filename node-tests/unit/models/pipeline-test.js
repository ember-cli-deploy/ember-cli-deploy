var Promise  = require('ember-cli/lib/ext/promise');
var Pipeline = require('../../../lib/models/pipeline');

var expect   = require('../../helpers/expect');
var FakeProgressBar   = require('../../helpers/fake-progress-bar');

describe ('Pipeline', function() {
  describe ('initialization', function() {
    it('initializes the given list of hooks plus the `didFail`-hook', function() {
      var subject = new Pipeline(['willDeploy', 'didDeploy']);

      expect(Object.keys(subject._pipelineHooks).length).to.eq(3);
      expect(subject._pipelineHooks.willDeploy).to.eql([]);
      expect(subject._pipelineHooks.didDeploy).to.eql([]);
      expect(subject._pipelineHooks.didFail).to.eql([]);
    });

    it('configures logging colors with defaults', function() {
      var subject = new Pipeline([]);
      expect(subject.logInfo._styles).to.eql(['blue']);
      expect(subject.logError._styles).to.eql(['red']);
    });

    it('configures logging colors', function() {
      var subject = new Pipeline([], {
        ui: {
          logInfoColor: 'green',
          logErrorColor: 'yellow'
        }
      });
      expect(subject.logInfo._styles).to.eql(['green']);
      expect(subject.logError._styles).to.eql(['yellow']);
    });
  });

  describe ('#register', function() {
    it('registers functions for defined hooks', function() {
      var subject = new Pipeline(['willDeploy'], {
        ui: {write: function() {}}
      });
      var fn      = function() {};

      subject.register('willDeploy', fn);

      expect(subject._pipelineHooks.willDeploy.length).to.eq(1);
      expect(subject._pipelineHooks.willDeploy[0].name).to.eq('anonymous function');
      expect(subject._pipelineHooks.willDeploy[0].fn).to.eql(fn);
    });

    it ('doesn\'t register functions for hooks not defined', function() {
      var subject = new Pipeline(['willDeploy'], {
        ui: {write: function() {}}
      });
      var fn      = function() {};

      subject.register('build', fn);

      expect(subject._pipelineHooks.willDeploy.length).to.eq(0);
      expect(subject._pipelineHooks.build).to.eq(undefined);
    });
  });

  describe ('#execute', function() {
    it('runs the registered functions', function() {
      var subject = new Pipeline(['hook1', 'hook2'], {ui: {write: function() {}}});
      var hooksRun = [];

      subject.register('hook1', function() {
        hooksRun.push('1');
      });

      subject.register('hook2', function() {
        hooksRun.push('2');
      });
      return expect(subject.execute()).to.be.fulfilled
        .then(function() {
          expect(hooksRun.length).to.eq(2);
          expect(hooksRun[0]).to.eq('1');
          expect(hooksRun[1]).to.eq('2');
        });
    });

    it('executes the `didFail`-hook as soon as one of the pipeline hooks rejects', function() {
      var subject = new Pipeline(['hook1', 'hook2'], {ui: {write: function() {}}});
      var hooksRun = [];

      subject.register('hook1', function() {
        hooksRun.push('hook1');
      });

      subject.register('hook2', function() {
        return Promise.reject();
      });

      subject.register('hook3', function() {
        hooksRun.push('3');
      });

      subject.register('didFail', function() {
        hooksRun.push('didFail');
      });

      return expect(subject.execute()).to.be.rejected
        .then(function() {
          expect(hooksRun.length).to.eq(2);
          expect(hooksRun[0]).to.eq('hook1');
          expect(hooksRun[1]).to.eq('didFail');
        });
    });

    it('passes the default context object when one isn\'t provided', function() {
      var subject = new Pipeline(['hook1'], {ui: {write: function() {}}});
      var data = null;

      subject.register('hook1', function(context) {
        data = context;
      });

      return expect(subject.execute()).to.be.fulfilled
        .then(function() {
          expect(data).to.deep.equal({});
        });
    });

    it('passes the provided context object to hooks when provided', function() {
      var subject = new Pipeline(['hook1'], {ui: {write: function() {}}});
      var data = null;

      subject.register('hook1', function(context) {
        data = context;
      });

      return expect(subject.execute({deploy: {}})).to.be.fulfilled
        .then(function() {
          expect(data).to.deep.equal({deploy: {}});
        });
    });

    it('merges the return value (object) of each hook into the context', function() {
      var subject = new Pipeline(['hook1'], {ui: {write: function() {}}});
      var finalContext = null;

      subject.register('hook1', function() {
        return {age: 47};
      });

      subject.register('hook1', function(context) {
        finalContext = context;
      });

      return expect(subject.execute({name: 'test-context'})).to.be.fulfilled
        .then(function() {
          expect(finalContext.name).to.equal('test-context');
          expect(finalContext.age).to.equal(47);
        });
    });

    it('merges the return value (promise) of each hook into the context', function() {
      var subject = new Pipeline(['hook1'], {ui: {write: function() {}}});
      var finalContext = null;

      subject.register('hook1', function() {
        return Promise.resolve({age: 47});
      });

      subject.register('hook1', function(context) {
        finalContext = context;
      });

      return expect(subject.execute({name: 'test-context'})).to.be.fulfilled
        .then(function() {
          expect(finalContext.name).to.equal('test-context');
          expect(finalContext.age).to.equal(47);
        });
    });

    it('merges the return value of each hook with the context using concatenation', function() {
      var subject = new Pipeline(['hook1'], {ui: {write: function() {}}});
      var finalContext = null;

      subject.register('hook1', function() {
        return { paths: ['/tmp/path', '/var/path'] };
      });

      subject.register('hook1', function(context) {
        finalContext = context;
      });

      return expect(subject.execute({paths: ['/opt/path']})).to.be.fulfilled
        .then(function() {
          expect(finalContext.paths).to.deep.equal(['/opt/path', '/tmp/path', '/var/path']);
        });
    });
  });

  describe('#hookNames', function() {
    it('returns the names of the registered hooks', function() {
      var subject = new Pipeline(['hook1', 'hook2']);

      var result = subject.hookNames();

      expect(result).to.have.members(['hook1', 'hook2', 'didFail']);
    });
  });

  describe('progressBar', function() {
    it('is initalized if showProgress is true', function() {
      var ui = {
        showProgress: true,
      };
      var subject = new Pipeline(['hook1'], {
        ui: ui,
        progressBarLib: FakeProgressBar
      });

      subject.execute();

      expect(subject._ui.progressBar).to.be.ok;
    });

    it('is not used in --verbose mode', function() {
      var ui = {
        verbose: true,
        showProgress: true,
        write: function() {}
      };
      var subject = new Pipeline(['hook1'], {
        ui: ui,
        progressBarLib: FakeProgressBar
      });

      subject.execute();

      expect(ui.progressBar).to.be.falsy;
    });

    it('calculates the total number of registered hooks functions', function() {
      var ui = {
        showProgress: true,
      };
      var subject = new Pipeline(['hook1', 'hook2'], {
        ui: ui,
        showProgress: true,
        progressBarLib: FakeProgressBar
      });

      subject.register('hook1', function() {});
      subject.register('hook1', function() {});
      subject.register('hook2', function() {});
      subject.execute();

      expect(subject._ui.progressBar.total).to.equal(3);
    });

    it('excludes the configure hooks from the total', function() {
      var ui = {
        showProgress: true,
      };
      var subject = new Pipeline(['configure', 'hook1'], {
        ui: ui,
        showProgress: true,
        progressBarLib: FakeProgressBar
      });

      subject.register('hook1', function() {});
      subject.register('hook1', function() {});
      subject.register('configure', function() {});
      subject.execute();

      expect(subject._ui.progressBar.total).to.equal(2);
    });

    it('ticks during execution', function() {
      var ui = {
        showProgress: true,
      };
      var subject = new Pipeline(['hook1', 'hook2'], {
        ui: ui,
        showProgress: true,
        progressBarLib: FakeProgressBar
      });

      var fn1 = {
        fn: function() {},
        name: 'fn1'
      };
      var fn2 = {
        fn: function() {},
        name: 'fn2'
      };

      subject.register('hook1', fn1);
      subject.register('hook2', fn2);

      return expect(subject.execute()).to.be.fulfilled
        .then(function() {
          expect(subject._ui.progressBar.ticks).to.eql(
            [{hook: 'hook1', plugin: 'fn1'},
             {hook: 'hook2', plugin: 'fn2'}
            ]
          );
        });
    });
  });
});
