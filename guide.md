Hey all, I wrote some thoughts [here](https://emberclideploy.slack.com/archives/general/p1453527148000049) about reorganizing the docs.

tl;dr, I think we can restructure things to make the project more approachable. Here's my proposed structure:

---

### Getting started

- Overview
- Installation
- Upgrade guide
- Quick start

### Setting up your pipeline

- Determining needs
    + Explain that deploy pipelines tend to be unique. Explain common things to be aware of when formulating a deploy strategy. Recommend the lightening approach and explain why (speed, ability to preview and rollback).
    - Using plugins
        + Explain once you've identified your needs, next step is to configure your deploy pipline with plugins that accomplish these tasks. *Briefly* explain the pipeline, and the structure it provides. Explain that then, you should look for community plugins that provide the functionality you need. Describe configuration via deploy.js. Explain that only when you cannot find an existing plugin should you write your own. Give a short example of writing your own, with a link to a more comprehensive guide.
        - Deploying your app
            + Explain how to use ECD once your app has a configured pipeline. Explain deploying to different targets, activation, immediate activation, rollback, listing. 
            - Plugin packs
                + Explain that after you have a set of plugins that work for your app, how keeping them in sync can be cumbsersome. Explain that plugin packs were created to solve this problem - a way to bundle up your whole configured pipeline into a single addon. Now new apps can use this addon and get all the registered functionality from each plugin within the pack.

### Authoring plugins

- Creating a plugin
- Pipeline hooks
- The deployment context
- Creating a plugin pack

### Cookbook

- Default options for the deploy command
- Using .env for secrets
- Including a plugin twice
- Development workflow

### Reference

- Configuration
- Other API/Classes

---

Some other random thoughts:

- We should use the "Plugins" route at the top of the site to list plugins and plugin packs, rather than a link within the docs. Maybe we can have a list that can filter on version, or just a few different child routes.
- I don't think we need to document fingerprinting, I think it should be the responsibility of the S3 plugins to explain fingerprinting and point users to Ember CLI's docs.

Ok, let me know what you think!
