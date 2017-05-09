# Summary

The `context` object, while flexible, is a poor representation of the domain model of deployment. A growing ecosystem calls for more guidance. This RFC introduces a stronger domain model, while still maintaining the original flexibility.

# Background

The `ember-cli-deploy` project uses a pipeline to trigger their different stages of deployment. Those stages are, in short, `configure`, `build`, `upload`, `activate`. Plugins installed to the `ember-cli` project have hooks triggered in those stages, where they have a chance to perform their function.

Throughout the pipeline plugins read, write and share state through the so-called `context` object, a hash which can contain raw values and also functions. An example would be the `ember-cli-deploy-build` plugin, which in the `build` step compiles the container `ember-cli` project and writes the resulting array of files to `context.distFiles`. Other plugins then follow to upload those files to s3, Azure or other services.

The ecosystem of plugins has grown to a total of 57 by now. They have dependencies on the information and information format put into the `context` object, plus the timing of the hooks. An informal domain model is less suited for a growing ecosystem. Implicit dependencies and decentralized decisions about plugin ordering makes maintaining the ecosystem challenging.

# Proposal

The `context` object itself should be immutable, the only modifications taking place with the return values from hooks. Verification of appropriateness of returned values would take place in `ember-cli-deploy`, possibly warning against deprecations, possibly linting return values.

Consuming values in the `context` object would be done by using wrapper functions, possibly in `ember-cli-deploy-base-plugin`, e.g.

```javascript
readFiles: function() {
  return context.distFiles;
}
```

The possible functions are

- readFiles
- readRevisions
- (... to be completed)

# Drawbacks

- Plugin ordering concerns, e.g. of the `gzip`, `sentry` and `s3` plugins is not well solved by the proposed solution, and remains an open discussion on managing dependencies.

# Alternatives

1. If plugins emit what information they would want to consume (files, a minimatch pattern, revision hash, previous deployments) as subscribers on these topics, plus what they could produce as producers on these topics, an automated plugin ordering could be made, also removing the need for set hooks. Context information would be per-topic, passed into the function, instead of globally available.

# Unresolved questions

- FastBoot and potential needs for provisioning over just deployment have not been considered.
