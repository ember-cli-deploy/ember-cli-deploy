---
title: Default CLI Options
---

As described in [Usage Overview](../usage-overview/), the commands ember-cli-deploy makes available to Ember CLI accept various flags such as `--verbose`, `--activate`, and `--revision=[revision]`.

As of ember-cli-deploy 0.6.x, it is possible to configure options that you always want sent instead of having to type them each time.

Ember CLI apps can have a `.ember-cli` file in the app's root directory that allows general overriding of command line options. However, its entries apply globally across all commands, which may not be what you want. For example, if you specify `verbose: true` in the file, *all* `ember *` commands will receive `--verbose`

If you want to apply changes to just ember-cli-deploy commands, nest the configuration in an object assigned to the `ember-cli-deploy` property. For example, to make the ember-cli-deploy commands run with `--verbose` automatically, you would have a file like this:

```javascript
// .ember-cli
{
  "ember-cli-deploy": {
    "verbose": true
  }
}
```

Other supported options that can be configured like this are `deploy-config-file` (string), `amount` (number, how many revisions to list), and `activate` (boolean).
