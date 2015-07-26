---
title: Lightening approach workflow
---

`ember-cli-deploy` is built around the idea of adapters for custom deployment strategies but for most people the approach Luke suggest in his talk will be a perfect fit.

To use the Lightning-Approach workflow from Luke's talk you will also need to install the redis- and s3-adapters for `ember-cli-deploy`:

```
npm install ember-deploy-redis ember-deploy-s3 --save-dev
```

[__Please watch Luke's Talk before using this project!__](https://www.youtube.com/watch?v=QZVYP3cPcWQ)

The TL;DR of the talk is that you want to serve your bootstrap index.html that Ember-CLI builds for you from a Key-Value store via your Backend and serve the rest of your assets from a static file hoster like for example [S3](https://aws.amazon.com/de/s3/). This is a sketch of what this Addon gives you out of the box:

![Workflow](https://dl.dropboxusercontent.com/s/tun9kbr4eyrcama/ember-deploy.png?dl=0)

A deployment consists of multiple steps:

1. Build your assets for production via `ember build --environment production`
2. Upload assets to S3.
3. Upload your bootstrap index.html to a key-value store.
4. Activate the uploaded index.html as the default revision your users will get served from your backend.

If you don't install the redis- and s3-adapters you will need to use a custom adapter you or the community have written. Please have a look at the Custom-Adapters section of this README for further information. In essence your custom adapters will implement the same steps as for the Lightning-Approach but you can customize the different steps as you see fit.
