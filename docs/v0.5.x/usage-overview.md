---
title: Usage Overview
---

Once you've installed your plugins and configured your deployment strategy you're ready to **deploy**!

ember-cli-deploy currently supports 3 commands, each of them takes a first mandatory argument `<deployTarget>` (i.e. `'production'`) and some optional parameters.

### `ember deploy`

Runs the main [deploy pipeline](../pipeline-hooks/#hooks-by-command) that takes care of deploying your assets and your `index.html` file.

It optionally takes a `--activate` flag that also triggers the `activate*` hooks passing the `revision` that just got uploaded.

**Example:**

```
ember deploy production
```

### `ember deploy:activate`

Runs a pipeline with the `activate*` hooks that some plugins implement to make a specific revision as the active one to be served by your backend.

Takes a mandatory `--revision=revisionKey` parameter.

**Example:**

```
ember deploy:activate production --revision=43cc587
```

### `ember deploy:list`

Runs the `fetchRevisions` and `displayRevisions` hooks used to determine what `revisions` are currently available in your deployment and displays them.

See [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions) for a possible output plugin.

**Example:**

```
ember deploy:list production
```
