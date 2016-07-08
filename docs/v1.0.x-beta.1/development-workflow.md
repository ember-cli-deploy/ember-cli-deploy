---
title: Development Workflow
---

`ember-cli-deploy` is an addon for deploying apps. It works fine for cases where your ember-cli app and API app are mostly developed in isolation. However, there are some cases where using ember-cli's `--proxy` command line option is inadequate. For example:

  - authentication happens within your API application
    you are progressively updating an app to Ember or
    developing a hybrid app (i.e. some pages are served
    by the API application) and you need both
    applications to work together seamlessly
  - the API app injects some initial state (e.g. session
    info or model preloads) into your ember-cli app's
    index page so that it is available without having to
    make xhr requests on boot

The development workflow simply writes your ember-cli app's index to your key-value store on each build so that your API app can read (and possibly modify) it just as it would in production.

During app development, `ember server` is used to recompile and serve the assets as usual while the app index is served by your API app, eliminating the need to setup CORS or proxies.

This strategy can be easily accomplished with some ember-cli-build.js configuration. Keep in mind that you will need to modify your fingerprintOptions in development to prepend your ember-cli server host and port. This way requests for Ember assets still go to ember-cli and not your API application.

The following is an example that pushes the index.html to redis on each build:

in your ember-cli-build.js

```js
module.exports = function(defaults) {
  var env = EmberApp.env()|| 'development';
  ...

  var fingerprintOptions = {
    enabled: true,
    ...
  };

  switch (env) {
    case 'development':
      // use fingerprinting to prepend your ember server domain path
      fingerprintOptions.prepend = 'http://localhost:4200/';
    break;
    ...
  }

  var app = new EmberApp(defaults, {
    fingerprint: fingerprintOptions,
    emberCLIDeploy: {
      // returns the deployTarget
      runOnPostBuild: (env === 'development') ? 'development-postbuild' : false,
      // optionally specifiy a different config file
      configFile: 'config/deploy.js',
      // optionally call the activate hook on deploy
      shouldActivate: true,
    },
    ...
  });

  return app.toTree();
};
```

in config/deploy.js you can define a custom pipeline for your deploy env.

```js
  if (deployTarget === 'development-postbuild') {
    ENV.pipeline = {
      // only use the redis pluging
      disabled: {
        allExcept: ['redis']
      }
    };

    ENV.build = {
      environment: 'development'
    };

    ENV.redis = {
      keyPrefix: 'edd-cli',
      revisionKey: '__development__',
      allowOverwrite: true,
      host: 'localhost', // this can be omitted because it is the default
      port: 6379, // this can be omitted because it is the default
      distDir: function(context) {
        return context.commandOptions.buildDir;
      }
    };
  }
```

see [ember-deploy-demo](https://github.com/ghedamat/ember-deploy-demo/blob/master/edd-cli/config/deploy.js#L4-L21) for a full example.
