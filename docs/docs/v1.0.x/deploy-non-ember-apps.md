---
title: Deploy non-Ember Apps
---

While Ember CLI Deploy is specifically aimed towards Ember, it actually has very little integration with the framework and CLI.

For other frameworks, the tool to use is [DeployJS](https://github.com/deployjs/deployjs-cli). With this, it's just as easy to deploy your Angular or React application. It's compatible with most plugins written for Ember CLI Deploy.

Get started by installing the DeployJS CLI, `npm install -g @deployjs/cli`. [Determine your needs](../determining-needs/) and [install plugins](../../../plugins/) provided by the community, or write your own.

Different deployment scenarios require different plugins. In these examples we have taken as a baseline deployment to AWS S3.

## Deploying Angular 1

This example assumes you use `grunt` to build your application. If you don't, there's [plugins for alternative build processes](#deploying-angular-2-react-vue-).

The application set up looks like the following:

```sh
# Install the Build plugin, which builds your app during deployment
npm install --save-dev @deployjs/grunt-build

# Install the S3 plugin, to upload our app and index.html to S3
npm install --save-dev ember-cli-deploy-s3 ember-cli-deploy-s3-index

# Install other plugins, to use gzip, to display past revisions, to do a differential upload, ...
npm install --save-dev ember-cli-deploy-gzip ember-cli-deploy-manifest ember-cli-deploy-revision-data
```

Some of these plugins require a little configuration - for example, to which S3 bucket to upload the app. These are stored in `config/deploy.js`

```sh
// config/deploy.js

module.exports = function(deployTarget) {
  var ENV = {};

  ENV['s3'] = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: 'my-ember-app',
    region: 'us-east-1'
  };

  ENV['s3-index'] = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: 'my-ember-app-index',
    region: 'us-east-1'
  };
  return ENV;
};
```

Now, we can deploy our application:

`ember deploy production`


## Deploying Angular 2, React, Vue, ...

If you're not building your application with `grunt`, other options exist for producing your assets and `index.html`. The process as above is the same, with the exception of installing `@deployjs/grunt-build`. Instead, you should:

* For Angular 2+ using the Angular CLI, `npm install --save-dev @deployjs/angular-build`
* For React using Webpack, `npm install --save-dev @deployjs/react-build`
* For other scenarios (like building Vue), [build on the existing build plugin](../creating-a-plugin/#the-base-deploy-plugin) - as a reference, [have a look at `@deployjs/grunt-build`](https://github.com/deployjs/deployjs-grunt-build). They can be just wrappers around a shell command. Create a PR to include it in this list.
