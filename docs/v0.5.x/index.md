---
title: Overview
---

## So, what is ember-cli-deploy?

In short, ember-cli-deploy is a tool that allows users to deploy their Ember applications, easily, flexibly and reliably.

Prior to ember-cli-deploy, there was no one straight answer to the question - "How do I deploy my Ember app?". ember-cli-deploy strives to answer this question by providing
a standardised, flexible deployment pipeline combined with a rich ecosystem of plugins that allow users to easily and flexibly deploy to any setup.

## Why should I use it? I already have a deployment script

Sure you do. And so does every one else. In fact their deployment scripts probably look a lot like yours. But slightly different. Maybe with a few extra bugs.
And highly tailored for their use case and deployment setup.

The point of ember-cli-deploy is to have a highly flexible, standardised way to deploy Ember applications that is community supported. It takes away the need for you to worry
about the maintance of your deployment scripts and lets you focus on the important stuff.

## How does it work?

Basically, ember-cli-deploy is a deployment pipeline on which one or more plugins are registered.

You choose and configure the plugins you want to use, and ember-cli-deploy executes the pipeline with each plugin performing the one task it's designed to do.

The tasks could be things like compressing or encoding files, sending these files to this server, and this file to that server or notifying your team, etc.

The end result is that your application is deployed the way you want it to be, and there is no custom code to maintain!

## Ok, cool! So, what now?

If you are still wondering what some of the concepts mentioned above mean, then jumping across to [The Deploy Pipeline](./pipeline-overview) and [Plugins](./plugins-overview) would be a great start.

Otherwise, if you're keen to dive in and give ember-cli-deploy a go, head on over to [Installation](./installation).
