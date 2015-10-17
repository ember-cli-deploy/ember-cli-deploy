---
title: The Deployment Context
---

For each high-level ember-cli-deploy operation, a `context` object is created.

This object is passed to each hook that is invoked on the plugins.
It has a number of properties that may be of use to a plugin:

property | file | info
--- | --- | ---
`ui` | - | The ember-cli UI object used to write to stdout.
`project` | - | The ember-cli project object.
`config` | `config/deploy.js` | The configuration returned by the config file for the active environment.


In order to pass runtime information about the current operation, plugins can set properties on the `context` object for later use by themselves or for another plugin.
They do this by simply returning a simple hash from their hooks.

When a hook is invoked its return value is **merged** back into the context Object.

**Example:**

The `ember-cli-deploy-revision-data` plugin uses its `prepare` hook to return an object with this shape:
`{ revisionData: ... }`.

Later in the lifecycle the `ember-cli-deploy-redis` plugin can find the same `revisionData` key in the `context` object that is passed to its `upload` hook, and use it to determine the key to use for saving the `index.html` file in redis.
