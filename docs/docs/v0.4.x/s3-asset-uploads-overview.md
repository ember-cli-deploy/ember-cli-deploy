---
title: S3 asset uploads overview
---

`ember-deploy-s3` sets the correct cache headers for you. Currently these are hard coded to a two year cache period. Assets are also gzipped before uploading to S3. This should be enough to cache aggressively and you should not run into problems due to ember-cli's fingerprinting support. I will try to add more configuration options for caching in the near future.
