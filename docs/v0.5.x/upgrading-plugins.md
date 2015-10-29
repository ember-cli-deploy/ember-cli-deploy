---
title: Upgrading Plugins
---

Ember CLI Deploy 0.5.x introduces the concept of a deploy pipeline. Instead of writing *adapters* (like you did in 0.4.x), you write *plugins*, and then compose these plugins to configure your application's deploy pipeline. 

While adapters had specific types (index adapter, asset adapter, etc.), plugins are generic, and are defined only by the [pipeline hooks](./pipelin-hooks) they implement.

The changes you need to make to upgrade your adapter depends on its type.

### Changes for all adapters

  1. Add "ember-cli-deploy-plugin" to your addon's `package.json`

  2. Install the [base plugin](https://github.com/ember-cli-deploy/ember-cli-deploy-plugin), and update your adapters to subclass it

  3. Implement `createDeployPlugin` in `index.js` and return a subclass of `ember-cli-deploy-plugin`

  4. Use the pipeline hooks to do the actual work:
      - move uploading logic (from your index/asset adapters) to the `upload` hook
      - move activation logic (from your index adapter) to the `activate` hook

  5. Instruct your users to [update their config](./configuration-overview) and install [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build)

  6. Replace `console.log` statements with `this.log` to play nicely with Ember CLI Deploy's messaging

      - Messages passed to `this.log` are displayed only when the verbose flag (`--verbose`) is present. You can pass `{ verbose: true }` as the second param to `this.log` to force your message to always display during pipeline execution.

### Changes for index/store adapters

  1. Instruct your users to install [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data)

  2. The revision key is now under `context.revisionData.revisionKey` (provided ember-cli-deploy-revision-data is installed). It doesn't include your project name yet.

      ```js
      _key: function(context) {
        var revisionKey = context.commandOptions.revision || context.revisionData.revisionKey.substr(0, 8);
        return context.project.name() + ':' + revisionKey;
      }
      ```

  3. Previously, the contents of `index.html` was passed to your upload function. Now, you'll need to read the file using the filesystem package:

      ```js
      var path      = require('path');
      var fs        = require('fs');
      var readFile  = denodeify(fs.readFile);

      upload: function() {
        readFile(path.join(context.distDir, "index.html"))
        .then(function(buffer) {
          return buffer.toString();
        }).then(function(indexContents) {
          // upload indexContents
        });
      }
      ```

### Changes for asset adapters

  1. Replace any hard referenes to "tmp/asset-sync" with `context.distDir`
