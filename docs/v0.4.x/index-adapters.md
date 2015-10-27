---
title: Index adapters
---

`index-adapters` take care of publishing bootstrap-index html that ember-cli builds for you. If you don't want to use `redis` as a key-value store for your index.html files if you are using the Lightning approach from Luke Melia's talk you could for example create a `cassandra`-adapter to use [Apache Cassandra](http://cassandra.apache.org/) instead.

Index adapters have to implement the following methods for `ember-cli-deploy` to be able to use them:

####`upload([bootstrapIndexHTML])`

  __Parameters__

  _bootstrapIndexHTML_

  `upload` will get passed the content of `dist/index.html` that gets build from ember-cli. Feel free to do whatever you need to do with its file content.

  This method has to return a `RSVP.Promise`.

####`activate([revisionToActivate])`

__Parameters__

_revisionToActivate_

`activate` takes a revision you pass to it and activates it in the key-value store. The `redis`-adapter for example takes the passed revision-key and sets it as the value of the `<project.name>:current`-key in redis. Of course you can do whatever you want in this method. If you decide that you don't need a notion of activating revisions it is recommended that you nevertheless return a useful message to the user in this method.

This method has to return a `RSVP.Promise`.

####`list`

`list` lists all uploaded revisions you have deployed and that you want the user to be able to preview or to rollback to. Of course you can do whatever you want in this method. If you decide that you don't need a notion of listing revisions it is recommended that you nevertheless return a useful message to the user in this method.

This method has to return a `RSVP.Promise`.
