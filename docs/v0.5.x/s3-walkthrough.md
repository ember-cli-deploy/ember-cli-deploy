---
title: S3 walkthrough
---

On this example, we'll build an ember-cli-deploy configuration from scratch. Step by step, we'll put the pieces together and get the application deployed to S3.

## Installing ember-cli-deploy

First thing is to install ember-cli-deploy proper. It's an Ember addon, so you install it just like any other:

    $ ember install ember-cli-deploy
    version: 1.13.13
    Installed packages for tooling via npm.
    installing deploy-config
      create config/deploy.js
    ember-cli-deploy needs plugins to actually do the deployment work.
    See http://ember-cli.github.io/ember-cli-deploy/docs/v0.5.x/quick-start/
    to learn how to install plugins and see what plugins are available.
    Installed addon package.

There's an important message there: **ember-cli-deploy needs plugins to actually do the deployment work**. Indeed, ember-cli-deploy does nothing by itself. Its job is to provide a framework (the **pipeline**) for other addons to work together, and therefore there are more elements to include.

Still, let's try deploy and see what happens. In ember-cli-deploy, you'd deploy with a command like this:

    $ ember deploy production
    version: 1.13.13

    WARNING: No plugins installed.

    ember-cli-deploy works by registering plugins in its pipeline.
    In order to execute a deployment you must install at least one ember-cli-deploy compatible plugin.

    Visit http://ember-cli.github.io/ember-cli-deploy/docs/v0.5.x/plugins/ for a list of supported plugins.

There are several pieces of information above:

  1. To deploy, use the `deploy` command to ember-cli.
  2. The command is followed by a word such as `production`, `staging`, or similar. This is the environment you intend to deploy. You can have different environments deploying with different configurations. For example, production and staging could be deployed to different locations.
  3. A big warning tells us: **No plugins installed**, followed by additional information. As mentioned before, ember-cli-deploy doesn't do anything. You need more pieces to get a deployment going.

So let's get those plugins installed.

## Building the project

The first plugin we should install is ember-cli-deploy-build:

    $ ember install ember-cli-deploy-build
    version: 1.13.13
    Installed packages for tooling via npm.
    Installed addon package.

Now we run the deploy command again to see what happens:

    $ ember deploy build
    version: 1.13.13

This time it doesn't complain, but what does it actually do? It simply builds the project in very much the same way `ember build` does. The result is left in `tmp/deploy-dist` by default:

    $ ls -l tmp/deploy-dist/
    total 24
    drwxr-xr-x  6 example  example   204  7 Jan 07:07 assets
    -rw-r--r--  1 example  example   585  7 Jan 06:23 crossdomain.xml
    -rw-r--r--  1 example  example  1967  7 Jan 07:07 index.html
    -rw-r--r--  1 example  example    51  7 Jan 06:23 robots.txt

This is the first step of the deployment process. Using ember-cli-deploy-build, you can control the build of the files to be deployed. Once this is complete, other plugins will take it from here.

## Uploading to S3

Install ember-cli-deploy-s3:

    $ ember install ember-cli-deploy-s3
    version: 1.13.13
    Installed packages for tooling via npm.
    Installed addon package.

Of course, we need to add some configuration to get this uploading to the right S3 bucket with appropriate credentials. This configuration is stored on the file `config/deploy.js`, which was added to the project when we first installed the base ember-cli-deploy addon.

If you open that file, you'll find (among other things) a declaration for an object called `ENV`. It should look something like this:

    var ENV = {
      build: {}
      // include other plugin configuration that applies to all deploy targets here
    };

We add an entry on `ENV` for each plugin we wish to configure. There's already an empty entry called `build`, which refers to ember-cli-deploy-build. Let's add another one for ember-cli-deploy-s3. From the [documentation of ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3), we can tell what the configuration parameters are. You should get something like this:

    var ENV = {
      build: {},

      s3: {
        accessKeyId: '<your-aws-access-key>',
        secretAccessKey: '<your-aws-secret>',
        bucket: '<your-s3-bucket>',
        region: '<the-region-your-bucket-is-in>'
      }
    };

You'll have to fill out your own values for those four keys. How to get them is outside the scope of this example though. The documentation for ember-cli-deploy-s3 has some help at the end, regarding permission policies. There's more documentation on the Internet.

SECURITY NOTE: the above is a simplification. You don't actually want to put secret credentials in that file. Fortunately, ember-cli-deploy supports [`.env` files](http://ember-cli.com/ember-cli-deploy/docs/v0.5.x/dotenv-support/) out of the box. Use that instead.

Once you have entered the correct configuration values, run the deploy command again:

    $ ember deploy production
    version: 1.13.13

If all is good, files should have been uploaded to S3. Check what's in the bucket; it should be similar to this:

    ├── assets
    │   ├── your-app-7f8b9fddc5857d711cc51ed2a3a8594d.js
    │   ├── your-app-d41d8cd98f00b204e9800998ecf8427e.css
    │   ├── vendor-b630d3abd77d527def683a18b2165a94.js
    │   └── vendor-d41d8cd98f00b204e9800998ecf8427e.css
    ├── crossdomain.xml
    └── robots.txt

So that's our app... except that `index.html` is not there. Where did that go?

The file `index.html` is not there because ember-cli-deploy-s3 does not upload it by default. This may sound counterintuitive, but there's a reason for that. For now, let's just tell it to upload that file too. To do this, we can add the following setting to the configuration:

    var ENV = {
      // ...
      s3: {
        filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,html}',
        // etc...
      }
    }

The setting `filePattern` tells ember-cli-deploy-s3 what files should be uploaded. I have just taken the default value and added `html` to the list of extensions. Try deploying again and you'll see that `index.html` is deployed this time.

Finally, your app should be usable at the web address of the S3 bucket, assuming that all configuration on the AWS side is correct (again, outside the scope of this example).

However, there are a few things we could do to improve the above.

## What could be better

At this point, we could just leave it at that and consider the deployment work complete. However we could do better.

If you have tried other deployment frameworks, they tend to provide means to roll back to an earlier version of your code. When you deploy new code, and something goes unexpectedly wrong, you can undo the changes to minimize damage. Of course you can just `git checkout` a previous version and deploy again, but there are better ways to do that.

Also, S3 doesn't automatically gzip files when serving them over HTTP. It offers a way to do it, but requires a bit of work on your part. How wonderful would it be to have ember-cli-deploy to do it for you?

Finally, when you deploy, all files in the app are uploaded. Sometimes an app includes a lots of assets, such as fonts, images, etc... and that can make for a hefty, slow deployment. What if ember-cli-deploy could tell which files already exist at the destination, and only uploaded those that had actually been changed or added?

## Rolling back to a previous version of the app

So you want to be able to quickly roll back to a previous version of the app. I'll describe a good way to get it done. You are going to need three plugins for this:

    $ ember install ember-cli-deploy-s3-index ember-cli-deploy-revision-data ember-cli-deploy-display-revisions
    version: 1.13.13
    Installed packages for tooling via npm.
    Installed addon package.

Why three plugins? In ember-cli-deploy, plugins try to be very simple, separating concerns as much as possible. This way, it's easier to change how specific parts of the pipeline work, and adapt them to your own needs. This is what these three plugins do:

  * **ember-cli-deploy-revision-data**: generates a revision ID, a unique string that identifies each deployed version of your app. This way, you can refer to each version univocally later. It comes with three different strategies to do this, which you can choose from.
  * **ember-cli-deploy-s3-index**: it does three things.
    1. Upload the `index.html` file to S3, but with the revision ID appended to the name (so it's uploaded as `index.html:[REVISION_ID]`)
    2. "Activate" a deployment by renaming its `index.html:[REVISION_ID]` file to `index.html` on S3
    3. Retrieve from S3 a list of the available files with name `index.html:[REVISION_ID]`
  * **ember-cli-deploy-display-revisions**: it displays on screen the list of revision IDs available, as retrieved by ember-cli-deploy-s3-index (or any other similar plugin)

Let's see an example of how all this works together. Let's say you have:

  1. All plugins described so far, all installed and configured, including the last three listed above
  2. No custom value for `filePattern` in the configuration of the s3 plugin. Let it be s3-index that uploads `index.html`, for it's its specialty

You deploy your application for the first time, and you get a file hierarchy on S3 similar to the following:

    ├── assets
    │   ├── your-app-7f8b9fddc5857d711cc51ed2a3a8594d.js
    │   ├── your-app-d41d8cd98f00b204e9800998ecf8427e.css
    │   ├── vendor-b630d3abd77d527def683a18b2165a94.js
    │   └── vendor-d41d8cd98f00b204e9800998ecf8427e.css
    ├── crossdomain.xml
    ├── index.html:edcb7aa1db0e3ec0620eef72841af7c1
    └── robots.txt

You'll notice that there's no `index.html`. Instead we only get the version with the revision ID appended to it. This is because the deployment is **not activated**. You can activate it by running this command:

    $ ember deploy:activate production --revision edcb7aa1db0e3ec0620eef72841af7c1
    version: 1.13.13
    - ✔  index.html:edcb7aa1db0e3ec0620eef72841af7c1 => index.html

An `index.html` is generated, copied from the file with the revision ID. Now you can access the app at its normal URL.

You continue working on your app, and at some point decide to deploy again. After doing that, you examine the files up on S3, and you find something like this:

    ├── assets
    │   ├── your-app-7f8b9fddc5857d711cc51ed2a3a8594d.js
    │   ├── your-app-8d66c8a24bfb2ddd6c51df425bd8e412.css
    │   ├── your-app-90748f7266852704a32b16d04e4f4489.js
    │   ├── your-app-d41d8cd98f00b204e9800998ecf8427e.css
    │   ├── vendor-b630d3abd77d527def683a18b2165a94.js
    │   └── vendor-d41d8cd98f00b204e9800998ecf8427e.css
    ├── crossdomain.xml
    ├── index.html
    ├── index.html:383edce606dd8ca8cfc43916c8d6b970
    ├── index.html:edcb7aa1db0e3ec0620eef72841af7c1
    └── robots.txt

Things to note:

  1. Some files appear several times, with different revision IDs. These are the files that have changed. Our deployment hasn't deleted the files from the previous version
  2. The file `index.html` is still the old one. Again, we need to run the activation in order to get it to be the new version
  3. Because all files from the current and the previous version are present, switching from one to the other (and back if necessary) is as simple as copying the correct file into `index.html`
  4. We can test the new version before activating it, by loading the appropriate `index.html:[REVISION_ID]` file from our browser

This is all there is to it. This is how all those plugins work together, enabling us to switch versions quickly when needed.

One last thing: we haven't yet used ember-cli-deploy-display-revisions. Let's do it now. This is the command provided by that plugin:

    $ ember deploy:list production
    version: 1.13.13
    -   timestamp           | revision
    - =================================
    -   2016/01/10 19:14:36 | 383edce606dd8ca8cfc43916c8d6b970
    - > 2016/01/10 19:01:23 | edcb7aa1db0e3ec0620eef72841af7c1

As mentioned before, this plugin is used to display the available revisions. It also marks the active one with a `>` character on the left. Using this, we can know what's deployed, what's available, and what revision ID we need to use for activation. Let's activate our new version:

    $ ember deploy:activate production --revision 383edce606dd8ca8cfc43916c8d6b970
    version: 1.13.13
    - ✔  index.html:383edce606dd8ca8cfc43916c8d6b970 => index.html

And we are good to go!

## Compressing files, and how plugins communicate

Nowadays, it's common for HTTP servers to compress files before sending them down to browsers. This translates into more efficient use of the bandwidth: smaller files that are transferred faster. Well known server software, such as Apache or Ngninx, will do this with minimal configuration.

However, S3 was not designed as a web server, but just as a file store. For this reason, it doesn't automatically compress files on transfer. However, it's still possible to do it with some configuration. Specifically, two things have to happen:

  1. Files must be uploaded already in compressed form
  2. Each compressed file has to be specifically configured to be served with the correct `Content-Encoding` header

Of course there's a plugin for this: ember-cli-deploy-gzip. This works in tandem with ember-cli-deploy-s3 (which we are already using), as follows:

  * ember-cli-deploy-gzip compresses the files resulting from the build
  * ember-cli-deploy-s3 notes that files are compressed, and adds the appropriate metadata on S3 as they are uploaded

Best of all, we don't need any additional configuration. The defaults on both plugins should work. Simply ensure they are both installed and deploy again:

    $ ember install ember-cli-deploy-gzip
    version: 1.13.13
    Installed packages for tooling via npm.
    Installed addon package.
    $ ember deploy production

NOTE: if you try to deploy, but there haven't been any changes since the last time, you'll get an error from ember-cli-deploy-s3-index. It will refuse to re-deploy and overwrite a version that already existed in S3. This is perfectly normal. You can either make a small change in your project (effectively generating a new version of the code) or add `allowOverwrite: true` to the configuration for s3-index (but remember to remove that afterwards unless you know what you are doing).

This is a good moment to reflect on how plugins communicate. When ember-cli-deploy-gzip compresses files, it needs to tell ember-cli-deploy-s3-index. This plugin will then know to, in turn, which files need additional metadata so that S3 serves them correctly. The mechanism for this is the [Deployment Context](../deployment-context).

The Deployment Context is simply a piece of shared state. It's an object that is passed to each plugin in the pipeline, on each invocation. Plugins read and write from it, passing information down to later steps in the chain. In this specific example, ember-cli-deploy-gzip creates a list of files that have been compressed, and stores it on `context.gzippedFiles`. At a later stage, ember-cli-deploy-s3 will read that key in the context. If it finds a list of files, it will know that those are the files that to which add this special metadata on S3.

## Uploading only files that have changed, and following the deployment process

One last feature before wrapping up. Let's install another plugin:

    $ ember install ember-cli-deploy-manifest
    version: 1.13.13
    Installed packages for tooling via npm.
    Installed addon package.

This new plugin, ember-cli-deploy-manifest, generates a file called `manifest.txt`. This is simply a list of the files that make the compiled app. Once it's done, it writes down the path to this manifest on the context, as `context.manifestPath`. This file (the "manifest") is eventually uploaded with all the others.

Some time later, you make changes to the app and deploy again. Before uploading any files, the s3 plugin notices that there's a manifest available (it knows to find it at `context.manifestPath`), and downloads the previous manifest from S3. It compares the file paths on the old and the new manifests. Since all files have fingerprints based on their contents (eg: `assets/vendor-a1b2c3d4.js`), the plugin is able to tell which files have changed since the last time. With this information, it will upload only the files that have actually changed since the last deployment. In large applications with many assets, this turns out to be significantly more efficient.

We can see exactly what files are uploaded, as it happens, using a feature of the `deploy` command. Try this:

    $ ember deploy production --verbose

This time the output of the command is... well, verbose! It lists:

  * Which plugins are present
  * What pipeline hooks they use
  * A real-time view of each stage of the process
  * Logs for each plugin on each stage

For example, let's pay attention this subset of the output:

    (...)
    |
    +- willUpload
    |  |
    |  (...)
    |  |
    |  +- manifest
    |    - generating manifest at `manifest.txt`
    |    - generated manifest including 6 files ok
    |
    +- upload
    |  |
    |  +- s3
    |    - Using AWS access key id and secret access key from config
    |    - preparing to upload to S3 bucket `ember-cli-deploy-example`
    |    - Downloading manifest for differential deploy from `manifest.txt`...
    |    - Manifest found. Differential deploy will be applied.
    |    - ✔  manifest.txt
    |    - ✔  assets/ember-cli-deploy-example-001ab321315c2abde5141ea9e46cc488.css
    |    - uploaded 2 files ok
    |
    (...)

This output relates to the interaction between the manifest and the s3 plugins. We can see that a manifest is generated during the `willUpload` stage of the pipeline, and this lists 6 files. Later, on the `upload` stage, the s3 plugin notices that a manifest is available, and knows to upload only two files, instead of all of them.
