# Plugins

A plugin is an ember-cli addon that hooks into the ember-cli-deploy
pipeline in order to add functionality to a deploy. Example addon
functionality would be uploading assets to S3, writing the index.html to
Redis, or notifying a Slack channel a deploy has completed.

Plugins should focus on doing a specific task. Ember developers will
compose and combine multiple plugins to fine tune their deployment
process.

### Identifying plugins

Plugins are published to npm as ember-cli addons. They will also have
the keyword ``ember-cli-deploy-plugin``.

Any plugin that is installed will be loaded by default, similar to
ember-cli addons.

### Base plugin object

Plugins will extend a base object provided by ember-cli-deploy. The API
of this object will be small to start, but it will give us an easy place
to give these plugins additional interfaces if needed.

```javascript
S3Plugin = DeployPlugin.extend({
  ...
});
```

### Hooks

Plugins hook into the deployment pipeline with function names that match
the steps in the pipeline process. These hooks will scoped under a
special hooks object inside the plugin so that any private or plugin
functions do not clash with any hook names that we add in
the future.

Although the hook functions are inside the hook object, they will be
executed with a `this` binding that points to the plugin object.

```javascript
S3Plugin = {
  hooks: {
    assets: function() {
      this.something();
      this.uploadToS3();
    })
  },

  something: function() { ... },

  uploadToS3: function() { ... }
}
```

### Provided properties

Ember-cli-deploy will inject a number of properties onto each plugin.

```javascript
S3Plugin = {
  ui: { ... },
  appConfig: { ... },
  deployConfig: { ... },
  pluginConfig: { ... }
}
```

Property | file | info
--- | --- | ---
`ui` | - | The ember-cli UI object that can be used to write to stdout.
`appConfig` | `config/environment.js` | The application configuration.
`deployConfig` | `config/deploy.js` | The deploy configuration file.
`pluginConfig` | stored in `config/deploy.js` | The plugin's configuration. See configuring section below.


Note: We can provide a default ``init`` that sets these properties.
Authors can override if needed.

### Plugins are singletons

Every plugin is a singleton that is created when the deployment pipeline
starts and torn down after the last pipeline step. The reasoning
here is it allows the plugin to maintain state between different hooks.
For example:

```javascript
TimerPlugin = DeployPlugin.extend({
  startAt: null,

  hooks: {
    willDeploy: function() {
      this.startAt = new Date();
    },

    didDeploy: function() {
      console.log('deploy took %s', new Date() - this.startAt);
    }
  }
});
```

### Returning from hooks

Hook functions can return a promise to block the deployment pipeline.
Since most deployment involves some sort of IO it makes senses that most
plugins will want an async function to complete before continuing to the
next step. If a plugin does not return a promise the next pipeline step
begins running.

Additionally, plugins can return a POJO, directly or from a promise,
with data about what happened. Future plugins can access that data,
more on that later.

```javascript
S3Plugin = {
  hooks: {
    assets: function() {

      return this.uploadToS3({ bucket: this.pluginConfig.bucket })
        .then(function(aws) {
          return {
            log: aws.log,
            bucket: aws.bucket
          };
        });
    }
  }
}
```

If a promise from any of the plugins is rejected then the deployment
pipeline will stop and ember-cli-deploy will exit. Returned rejected
promises are treated as unrecoverable errors.

### Accessing data

A plugin can access data from another plugin in two ways, by name or by
hook.

```javascript
S3Plugin = {
  hooks: {
    assets: function() {
      return this.uploadToS3()
        .then(function(aws) {
          return {
            log: aws.log
          }
        });
    }
  }
}
```

```javascript
ChatNotifierPlugin = DeployPlugin.extend({
  didDeploy: function() {
    // target a hook
    var assetLog = this.pluginValue('assets').log;

    // or target a specific plugin
    // this.pluginValue('s3-plugin:assets');

    this.notifyChat('deploys finished!')
    this.notifyChat(assetLog);
  }
});

```

At this point in the ember-cli-deploy project life cycle I don't think we
can expect plugin authors to conform to a unified interface. That is to
say, not all ``asset`` plugins will return the same data. This part of
the RFC is a huge gray area for me, but I think we need to allow this to
take place and see how plugin authors adopt it. Basically, give everyone
an escape hatch and see how they use it before trying to come up with an
API.

I'm not sure what to name this function, just called it `pluginValue`,
someone please come up with a better name.

### Commands and tasks

Plugins will have the ability to register their own commands to be used
outside of the deployment pipeline. These commands will use the
`Task` object that comes with ember-cli.

```javascript
S3Plugin = {
  hooks: { ... },

  commands: {
    doctor: Task.extend({
      // checks to make sure S3Plugin is configured correctly
      run: function() { ... }
    })
  }
}
```

This task would run as `ember deploy s3-plugin:doctor`.

Is this worth providing or should we just let plugin authors do this
themselves in their ember-cli-addons?

I think it might be worth exploring because there might be many common
tasks that these plugins provide. We could have an `ember deploy:doctor`
that runs the doctor task of each plugin and reports back their return
values. Things like `dry-run`, `doctor`, or `setup` might be common
tasks you would find across many different plugins.

### Configuration

Plugin configuration should be kept in `config/deploy.js` and scoped by
the plugin's name.

```javascript
module.exports = {
  production: {
    "s3-plugin": {
      bucket: "my-app-production",
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
};
```

This data will then be available to the `S3Plugin` function's as
`this.pluginConfig`.


