---
title: Deployment Strategies Overview
---

ember-cli-deploy is great at allowing you to compose plugins to implement a quick and maintainable deployment pipeline. What it is not great at
is guessing how you would like to deploy your application, where you'd like to deploy it, whether you'd like to gzip your assets or whether you'd
like to notify your team members on slack after a successful deploy.

Just like you need to have an idea of what functionality you would like your ember application to have before you install ember-cli addons, you also
need to have a good idea of how you would like your deployment to work before you instal ember-cli-deploy and it's plugins.

Almost every single project will require a build to begin with, but after this it's hard for ember-cli-deploy to guess what is needed.

Do you want to:

* upload your assets to a different place than your index.html?
* push your index.html to redis S3?
* deploy your whole application to a SaaS platform like Firebase hosting?
* gzip your assets before uploading them?
* notify your team members of a successful deploy

These things (and more) are the sorts of things that you need to have thought about before being able to successully deploy your application.

Because ember-cli-deploy simply provides you with a deployment pipeline it is up to you to decide what your deployment strategy will look like
therefore which plugins you will need to install to implement that stratgey.

We are well aware that this level of detail of the deployment environment may not be something everyone has thought about in detail so this section is
going to attempt to suggest things to think about when coming up with a deployment strategy that makes sense for you.


## Popular Deployment Strategies

Over time different deployment strategy patterns emerge as smart ways of deploying an ember application. We want to make it as easy as possible
for you to get up and deploying so we are putting together a list of popular deployment strategies that you can employ. This list is a living document
and will grow as we discover new and intersting ways that people are deploying their ember applications with ember-cli-deploy.

The list of deployment strategies is as follows:

* [The Lightning Strategy](../the-lightning-strategy)
