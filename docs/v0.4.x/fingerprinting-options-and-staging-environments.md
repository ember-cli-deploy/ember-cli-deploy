---
title: Fingerprinting
---

`ember-cli` comes with [fingerprinting
support](http://www.ember-cli.com/user-guide/#fingerprinting-and-cdn-urls) built-in. In
most production scenarios you will need to provide a `prepend`-property to your
app's fingerprint-property (to reference your CDN served assets correctly).

```javascript
// Brocfile.js
var app = new EmberApp({
  fingerprint: {
    prepend: 'https://subdomain.cloudfront.net/'
  }
});
```

`ember-cli` will only create a production like build for the
`production`-environment by default. If you want to support multiple
'production-like' environments you need to configure minification for these
environments manually. You can do someting like this:

```javascript
// Brocfile.js
var env = EmberApp.env();
var isProductionLikeBuild = ['production', 'staging'].indexOf(env) > -1;

var app = new EmberApp({
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

  vendorFiles: {
    'handlebars.js': {
      staging:  'bower_components/handlebars/handlebars.runtime.js'
    },
    'ember.js': {
      staging:  'bower_components/ember/ember.prod.js'
    }
  }
});
```
