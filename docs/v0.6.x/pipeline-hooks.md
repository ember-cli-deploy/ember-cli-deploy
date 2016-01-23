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
* fetchInitialRevisions,
* willUpload, upload, didUpload,
* willActivate, activate, fetchRevisions, didActivate, [1]
* fetchRevisions [2]
* teardown

[1] only if --activate flag is passed
[2] only if --activate flag is not passed
```

#### Detailed description:

```
configure: ---> Validate configuration and set defaults

setup: -------> The first hook for every command

                Runs before anything happens.
willDeploy: --> Good opportunity for plugins to validate
                configuration or other preconditions

           /-- willBuild  confirm environment
          /
build -----------> build  builds app assets, documentation, etc.
          \
           \--- didBuild  manipulate index.html, validate assets

           /--- willPrepare  confirm deployment info
          /
prepare ----------> prepare  information about the deploy,
          \                  eg revisonKey, timestamp, commit message
           \
            \--- didPrepare  notify APIS (slack etc)

fetchInitialRevisions -->  returns an object (or a promise resolving to
                           one) that has an `initialRevisions` property
                           whose value is an array of revision objects.[1]
                           i.e. `{ initialRevisions: [...] }`

           /--- willUpload  confirm remote servers(S3, Redis, Azure, etc.)
          /
upload -----------> upload  puts the assets somewhere
          \                 (S3, Redis, Azure, Rackspace, etc.)
           \
            \--- didUpload  notify APIs (slack, pusher, etc.), warm cache

            /--- willActivate  create backup of assets,
           /                   notify APIs, uninstall earlier versions
          /
activate ----------> activate  make a new version live
          \                    (clear cache, swap Redis values, etc.)
           \
            \- fetchRevisions  returns an object (or a promise resolving
             \                 to one) that has a `revisions` property
              \                whose value is an array of revision
               \               objects.[1] i.e. `{ revisions: [...] }`
                \
                 \- didActivate  notify APIs, warm cache

didDeploy: ----->  runs at the end of a full deployment operation.

teardown: ------>  always the last hook being run

[1] For information about the format of a "revision object",
    see "Revision Objects" below.
```


### Hooks for `ember deploy:activate`
```
* configure
* setup
* fetchInitialRevisions
* willActivate
* activate
* fetchRevisions
* didActivate
* teardown
```

#### Detailed description:

```
configure: --------------->  Validate configuration and set defaults

setup: ------------------->  The first hook for every command

fetchInitialRevisions ---->  returns an object (or a promise resolving
                             to one) that has an `initialRevisions`
                             property whose value is an array of
                             revision objects.[1]
                             i.e. `{ initialRevisions: [...] }`

          /--- willActivate  create backup of assets,
         /                   notify APIs, uninstall earlier versions
        /
activate --------> activate  make a new version live
        \                    (clear cache, swap Redis values, etc.)
         \
          \- fetchRevisions  returns an object (or a promise resolving
           \                 to one) that has a `revisions` property
            \                whose value is an array of revision
             \               objects.[1] i.e. `{ revisions: [...] }`
              \
               \- didActivate  notify APIs, warm cache

teardown: ---------------->  always the last hook being run

[1] For information about the format of a "revision object",
    see "Revision Objects" below.
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
configure: --------->  Validate configuration and set defaults

setup: ------------->  The first hook for every command

fetchRevisions: ---->  returns an object (or a promise resolving to one)
                       that has a `revisions` property whose value is an
                       array of revision objects.[1]
                       i.e. `{ revisions: [...] }`

displayRevisions: -->  looks up the `revisions` key in the `context`
                       and uses the information to display the list
                       of revisions.

teardown: ---------->  always the last hook being run

[1] For information about the format of a "revision object",
    see "Revision Objects" below.
```

See [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions) for a detailed example.

### The `didFail` hook

When a hook invocation rejects, the pipeline aborts execution.
As soon as that happens a special `didFail` hook is invoked on all the registered plugins.

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

### Revision Objects

The `fetchInitialRevisions` and `fetchRevisions` hooks described above
are expected to be an array of "revision objects". A revision
object is a Javascript object that conforms to the following:

Each revision object _must_ have a string `revision` key.
Each revision object _may_ have one or more one additional
properties. The following properties are considered "common"
and their types should be consistent across plugins:

    `version`:     (String) reference of version in SCM
    `timestamp`:   (Date) when the revision was created
    `deployer`:    (String) name/email address of developer
                            who deployed the version
    `active`:      (Boolean) is the revision activated?
    `description`: (String) summary of the revision
