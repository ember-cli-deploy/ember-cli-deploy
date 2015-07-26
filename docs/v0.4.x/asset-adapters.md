---
title: Asset adapters
---

`asset-adapters` take care of publishing your project assets. In the default use case (Luke Melia's lightning approach) your assets will be published to a static asset server like AWS S3. If you want to use some other static asset server service or you want to do something entirely different you can write your own `asset-adapter`. Asset-Adapters have to implement the following method for ember-cli-deploy to know what to do:

####`upload`

Ember deploy will gzip your `js` and `css` assets and copy these gzipped assets and all other assets from ember-cli's `dist`-folder to the `tmp/assets-sync`-directory. You can do whatever you want in an `asset-adapter`'s `upload`-method but most likely you will upload these assets to some kind of static-asset server with the `upload`-method.

This method has to return a `RSVP.Promise`.
