---
title: Overview
---

Ember CLI Deploy is an addon that provides a *single interface* for deploying Ember applications.

Just as any Ember app can be served with `ember serve` and built with `ember build`, any app using Ember CLI Deploy can be deployed with the same command: `ember deploy`.

To achieve this, Ember CLI Deploy provides some structure for your app's deployment in the form of a *deploy pipeline* consisting of several *pipeline hooks*. These standard hooks are the foundation for a **rich ecosystem of plugins** which you can compose to create a deployment process suitable for your application.

Whether you need to compress or encode assets, upload your files to a private server or to AWS, or notify a Slack channel after a successful deploy, Ember CLI Deploy is up to the task. Keep reading to learn more.
