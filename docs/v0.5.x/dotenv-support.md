---
title: dotEnv Support
---

It is often common to store sensitive data in environment variables and access them via `process.env` in the likes of `config/deploy.js`.

It is for this reason that ember-cli-deploy supports `.env` files out of the box.

In order to employ this functionality, simply create a file in the root of your project named `.env.deploy.<deploy-target>` where `<deploy-target>` is the target environment you are deploying to.
Pop your sensitive data into this file and then access them in your `config/deploy.js` via `process.env`

So, for example, if you were deploying to your staging environment like so:

```bash
ember deploy staging
```

You would create a `.env.deploy.staging` file in the root of your project like so:

```bash
# /.env.deploy.staging

AWS_KEY=123456
AWS_SECRET=abcdef
```

You could then access those environment variables in your `config/deploy.js` as follows:

```javascript
module.exports = function(deployTarget) {
  var ENV = { };

  if (deployTarget === 'staging') {
    s3: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    }
  }

  return ENV;
};
```
