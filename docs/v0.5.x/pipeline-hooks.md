---
title: Pipeline Hooks
---

The build pipeline is composed of a series of hooks that each deploy plugin can optionally implement.

Note:
If multiple plugins implement the same hook they will all be called, if you need to specify the order
you can use the `plugins: [...]` option in the [configuration](../configuration-overview).

### Hooks by command

Depending on the command, different hooks will be called (in order):

#### `ember deploy`
```
* configure
* setup
* willDeploy
* willBuild, build, didBuild,
* willPrepare, prepare, didPrepare,
* willUpload, upload, didUpload,
* willActivate, activate, didActivate, (only if --activate flag is passed)
* didDeploy,
* teardown
```

#### `ember deploy:activate`
```
* configure
* setup
* willActivate, activate, didActivate
* teardown
```

#### `ember deploy:list`
```
* configure
* setup
* fetchRevisions
* displayRevisions
* teardown
```

### Hooks description

These hooks (part of a typical deployment process) are available for plugins to implement:

```
configure: ---> Runs before anything happens

setup: -------> The first hook for every command

                Runs before anything happens.
willDeploy: --> Good opportunity for plugins to validate
                configuration or other preconditions

           /-- willBuild  confirm environment
          /
build ---------> prepare  builds app assets, documentation, etc.
          \
           \--- didBuild  manipulate index.html, validate assets

           /--- willPrepare  confirm deployment info
          /
prepare ----------> prepare  information about the deploy,
          \                  eg revisonKey, timestamp, commit message
           \
            \--- didPrepare  notify APIS (slack etc)

           /--- willUpload  confirm remote servers(S3, Redis, Azure, etc.)
          /
upload -----------> upload  puts the assets somewhere
          \                 (S3, Redis, Azure, Rackspace, etc.)
           \
            \--- didUpload  notify APIs (slack, pusher, etc.), warm cache

  Note: a plugin that implements upload of the HTML file and
        wants to support version activation should set
        `currentVersion` on the `deployment` object to the ID
        of the newly deployed version.

            /-- willActivate  create backup of assets,
           /                  notify APIs, uninstall earlier versions
          /
activate ---------> activate  make a new version live
          \                   (clear cache, swap Redis values, etc.)
           \
            \-- didActivate  notify APIs, warm cache

  Note: when hooks in the activate series of hooks are called,
        the plugin can assume the presence of a `currentVersion`
        property on the deployment object, that is set to
        the ID of the version to be activated.


didDeploy: --> runs at the end of a full deployment operation.

teardown: ---> always the last hook being run
```

In addition, there are a few more specialized hooks that plugins may implement:

```
discoverVersions: --> should return a promise resolving to an array
                      of version objects. Each version object _must_ have
                      an `id` property. Each version _may_ have one
                      or more of the following properties:

                      `timestamp`:   (Date) when the version was created
                      `revision`:    (String) reference of version in SCM
                      `creator`:     (String) email address of developer
                                     who deployed the version
                      `description`: (String) summary of the version

```

### Return values & Async operations in hooks

The return value of each hook can be used to add information to the [deployment context](../deployment-context).

Hook functions can return a promise to block the deployment pipeline.
Since most deployment involves some sort of IO it makes senses that most
plugins will want an async function to complete before continuing to the
next step.

If a plugin does not return a promise, then ember-cli-deploy proceeds immediately.

If a promise from any of the plugins is rejected then the deployment
pipeline will stop and ember-cli-deploy will exit. Returned promises that are
rejected are treated as unrecoverable errors.
