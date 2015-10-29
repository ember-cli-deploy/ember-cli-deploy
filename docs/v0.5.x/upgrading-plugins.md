---
title: Upgrading Plugins
---

In the transitionfrom 0.5.X ember-cli-deploy changed its working structure and moved from an adapter model to a pipeline appoach.
What used to be "adapters" in 0.4.X are now "plugins" hence in order to port your existing 0.4.X adapter you'll have to make some adjustments.
Notably the distinction between index and assets adapters is now gone, plugins just take part into the pipeline by implementing [`hooks`](./pipeline-hooks).

Depending on what type of adapters you're publishing, you'll have to make different amendments.

### For all adapters

1. update package.json keywords to include the keyword "ember-cli-deploy-plugin"
2. `npm install ember-cli-deploy-plugin --save` and subclass the new https://github.com/ember-cli-deploy/ember-cli-deploy-plugin for all your adapters.
3. implement `createDeployPlugin` in index.js and return an extended `ember-cli-deploy-plugin` from there.
4. listen to hooks to actually upload stuff, most notably upload (index and assets adapter) and activate (index adapter)
5. instruct your users to update their config (see above)
6. instruct your users to install ember-cli-deploy-build (see above) (there's discussion of whether to put this in ember-cli-deploy by default for 0.5.0, follow https://github.com/ember-cli/ember-cli-deploy/pull/179)
7. replace `console.log` statements to `this.log` to play nicely with the formatting in ember-cli-deploy

#### Notes

The log function is implemented in `ember-cli-deploy-plugin`, messages passed to `this.log` are displayed only in verbose mode by default (`--verbose`).

`this.log` takes a second parameter `options`, you can pass `{ verbose: true }` to ensure that some log messages are always displayed during pipeline execution

### For index/store adapters:
1. instruct your users to install ember-cli-deploy-revision-data (see above)
2. mind you that the revision key is now under `context.revisionData.revisionKey` (provided ember-cli-deploy-revision-data is installed) and it doesn't include your project name yet.

```javascript
_key: function(context) {
  var revisionKey = context.commandOptions.revision || context.revisionData.revisionKey.substr(0, 8);
  return context.project.name() + ':' + revisionKey;
}
```

3. mind you that you won't be passed the contents of index.html to your upload function, instead you will have to read the file using the filesystem package,

```javascript
var path      = require('path');
var fs        = require('fs');
var readFile  = denodeify(fs.readFile);

upload: function() {
  readFile(path.join(context.distDir, "index.html"))
  .then(function(buffer) {
    return buffer.toString();
  }).then(function(indexContents) {
    // do uploady stuff with contents here
  });
}
```

### For asset adapters:
1. if you have a hard reference to "tmp/asset-sync", replace that with `context.distDir`.
