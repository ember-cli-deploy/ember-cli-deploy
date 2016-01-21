---
title: Deployment Strategies Overview
---

ember-cli-deploy is great at allowing you to compose plugins to implement a quick and maintainable deployment pipeline.

What it is not great at is guessing how you would like to deploy your application, where you'd like to deploy it, whether you'd like to gzip your assets or whether you'd like to notify your team members on slack after a successful deploy.

Just like you need to have an idea of what functionality you would like your ember application to have before you install ember-cli addons, you also need to have a good idea of how you would like your deployment to work before you install ember-cli-deploy and it's plugins.

## Ok, so what do I need to think about?
Almost every single project will require a build to begin with, but after this it's hard for ember-cli-deploy to guess what is needed.

Do you want to:

* upload your assets to a different place than your index.html?
* push your index.html to redis S3?
* deploy your whole application to a SaaS platform like Firebase hosting?
* gzip your assets before uploading them?
* notify your team members of a successful deploy
* These things (and more) are the sorts of things that you need to think about before being able to successfully deploy your application.

Because ember-cli-deploy simply provides you with a deployment pipeline it is up to you to decide what your deployment strategy will look like and therefore which plugins you will need to install to implement that strategy.

We are well aware that this level of detail of the deployment environment may not be something everyone has thought about in detail so this section is going to suggest things you might want to think about when coming up with a deployment strategy that makes sense for you.

The following are some things that you should think through to make your ember-cli-deploy experience as successful as possible:

### Building your project
All projects need to be built, that's one thing we're pretty confident about. So for this we have created the [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) plugin.

This plugin uses the standard ember-cli build process. However if you have something more custom you need to do you can always write your own plugin.

### Identifying your deployed revision
Often you might want to identify a release by some unique identifier. Maybe you want to push this to firebase so that your ember app can intelligently tell when a user is using and out of date version of your app. If so, you need to think about where that unique identifier will come from. Should it be a fingerprint of your index.html file, or maybe the git SHA that you are deploying? Either way, we have a plugin called [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data) that can help determine a unique identifier for you.

### Hosting your project files
Where do you want your project files hosted? Some people like to use a SaaS platform such as Firebase. Or maybe [S3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3), Heroku or even Github Pages is more appropriate for you. Or maybe you just want to scp your project files to a server internal to your company.

If you can't find a suitable plugin in the list of [existing plugins](../plugins) then maybe try writing your own.

### Gzipping assets
Often people like to gzip their assets to minimise the payload user's browsers need to download when using an ember application. You probably want to think about doing this when storing your assets on S3. [ember-cli-deploy-gzip](https://github.com/ember-cli-deploy/ember-cli-deploy-gzip) is a good plugin to look at for this functionality.

### Source maps
Do you want to upload source maps to a bug reporting service or some other hosted service to make it easier to debug minified JS? This can often be handy when using services like BugSnag, Sentry and Raygun.

### Using a manifest file
Manifest files are helpful when uploading assets. Often some assets remain unchanged in which case there is no benefit in uploading them again. A manifest file is used to keep track of which files have been uploaded so that they don't need to be re-uploaded next time you deploy. We have a plugin for this called [ember-cli-deploy-manifest](https://github.com/ember-cli-deploy/ember-cli-deploy-manifest).

### Notifying team members of deployments
Once a deploy has finished successfully (or maybe failed as the case may be) you may find it handy to notify your team. Currently we have the [ember-cli-deploy-slack](https://github.com/ember-cli-deploy/ember-cli-deploy-slack) plugin to send notifications to Slack. However if you use a different platform or prefer to send emails instead, try writing your own plugin.

## Popular Deployment Strategies
Over time different deployment strategy patterns emerge as smart ways of deploying an ember application. We want to make it as easy as possible
for you to get up and deploying so we are putting together a list of popular deployment strategies that you can employ. This list is a living document
and will grow as we discover new and interesting ways that people are deploying their ember applications with ember-cli-deploy.

The list of deployment strategies is as follows:

* [The Lightning Strategy](../the-lightning-strategy)
