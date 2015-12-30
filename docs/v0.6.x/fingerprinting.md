---
title: Fingerprinting
---

## Usage

`ember-cli` comes with [fingerprinting support](http://www.ember-cli.com/user-guide/#fingerprinting-and-cdn-urls) built-in.

In most production scenarios you will need to provide a `prepend`-property to your
app's fingerprint-property (to reference your CDN served assets correctly).

```javascript
// ember-cli-build.js
var app = new EmberApp(defaults, {
  fingerprint: {
    prepend: 'https://subdomain.cloudfront.net/'
  }
});
```

This is especially useful when you're pushing your assets to a cloud service like Amazon S3 but serving your `index.html` from a different location as you need to use absolute urls.

## Managing multiple environments

`ember-cli` will only create a production like build for the
`production`-environment by default. If you want to support multiple
'production-like' environments you need to configure minification for these
environments manually.

You can do something like this:

```javascript
// ember-cli-build.js
var env = EmberApp.env();
var isProductionLikeBuild = ['production', 'staging'].indexOf(env) > -1;

var app = new EmberApp(defaults, {
  fingerprint: {
    enabled: isProductionLikeBuild,
    prepend: 'https://subdomain.cloudfront.net/'
  },
  sourcemaps: {
    enabled: !isProductionLikeBuild,
  },
  minifyCSS: { enabled: isProductionLikeBuild },
  minifyJS: { enabled: isProductionLikeBuild },

  tests: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
  hinting: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
});
```
