---
title: Tagging adapters
---

`tagging-adapters` take care of tagging revisions when uploading revisions via the `deploy-index`-command. `ember-cli-deploy` comes bundled with the `sha`-tagging-adapter that will tag your revisions according to the current git-sha.

Tagging Adapters need to implement the following method for ember-cli-deploy to know what to do:

####`createTag`

This method has to return a `String`.
