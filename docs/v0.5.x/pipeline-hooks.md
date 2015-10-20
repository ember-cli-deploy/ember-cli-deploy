---
title: Pipeline Hooks
---

The build pipeline is composed of a series of hooks that each deploy plugin can optionally implement.

Note:
If multiple plugins implement the same hook they will all be called, if you need to specify the order
you can use the `plugins: [...]` option in the [configuration](../configuration-overview).

## Hooks by command

Depending on the command, different hooks will be called (in order):

### Hooks for `ember deploy`
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

#### Detailed description:

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

            /-- willActivate  create backup of assets,
           /                  notify APIs, uninstall earlier versions
          /
activate ---------> activate  make a new version live
          \                   (clear cache, swap Redis values, etc.)
           \
            \-- didActivate  notify APIs, warm cache

didDeploy: --> runs at the end of a full deployment operation.

teardown: ---> always the last hook being run
```

### Hooks for `ember deploy:activate`
```
* configure
* setup
* willActivate, activate, didActivate
* teardown
```

#### Detailed description:

```
configure: ---> Runs before anything happens

setup: -------> The first hook for every command

            /-- willActivate  create backup of assets,
           /                  notify APIs, uninstall earlier versions
          /
activate ---------> activate  make a new version live
          \                   (clear cache, swap Redis values, etc.)
           \
            \-- didActivate  notify APIs, warm cache

teardown: ---> always the last hook being run
```

### Hooks for `ember deploy:list`
```
* configure
* setup
* fetchRevisions
* displayRevisions
* teardown
```

#### Detailed description:

```
configure: ---> Runs before anything happens

setup: -------> The first hook for every command

fetchRevisions: ----> returns an hash (or a promise resolving to one)
                      that has a `revisions` key and an array of revisions
                      objects as its value.  i.e. `{revisions: [...]}
                      Each revision object _must_ have
                      an `revision` key. Each revision _may_ have one
                      or more of the following properties:

                      `version`:     (String) reference of version in SCM
                      `timestamp`:   (Date) when the version was created
                      `deployer`:    (String) name/email address of
                                     developer who deployed the version
                      `active`:      (Boolean) is the revision activated?
                      `description`: (String) summary of the revision

displayRevisions: --> looks up the `revisions` key in the `context`
                      and uses the information to
                      display the list of revisions.

teardown: ---> always the last hook being run
```

See [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions) for a detailed example.

### The `didFail` hook

When an hook invocation rejects, the pipeline aborts execution.
As soon as that happens a special `didFail` hook that is invoked on all the registered plugins.

Plugins can optionally implement the `didFail` hook to handle any cleanup that might be needed in this case.

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
