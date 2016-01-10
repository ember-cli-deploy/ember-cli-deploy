---
title: dotEnv Support
---

It is often common to store sensitive data in environment variables and access them via `process.env` in the likes of `config/deploy.js`.

It is for this reason that ember-cli-deploy supports `.env` files out of the box.

## Basic Usage

Create a `.env` file at the root of your project. Pop your sensitive data into this file and then access them in your `config/deploy.js` via `process.env`.

```bash
# /.env

AWS_KEY=123456
AWS_SECRET=abcdef
```

Access those environment variables in your `config/deploy.js` as follows:

```javascript
module.exports = function(deployTarget) {
  var ENV = {
    s3: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    }
  };

  return ENV;
};
```

## Deploy-Target Specific Variables

For variables that are specific to a particular deployment target, create a file in the root of your project named `.env.deploy.<deploy-target>` where `<deploy-target>` is the target environment you are deploying to. Variables defined in an deploy-target specific file will override those defined in a top-level `.env` file.

So, for example, if you were deploying to your staging environment like so:

```bash
ember deploy staging
```

You would create a `.env.deploy.staging` file in the root of your project like so:

```bash
# /.env.deploy.staging

AWS_KEY=78910
AWS_SECRET=ghijkl
```

You then access those environment variables in your `config/deploy.js` as follows:

```javascript
module.exports = function(deployTarget) {
  var ENV = { };

  if (deployTarget === 'staging') {
    ENV.s3 = {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    };
  }

  return ENV;
};
```

## .gitignore

Remember to add all `.env` and `.env.deploy.<deploy-target>` files to your .gitignore file so you don't accidentally expose sensitive information.
