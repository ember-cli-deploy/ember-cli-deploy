# Summary

The `context` object, while flexible, is a poor representation of the domain model of deployment. A topic-based `pub/sub` might prove more robust, as might implementing a strict domain model.

More than proposing a definite solution, this should be seen literally as a request for comments.

# Background

The `ember-cli-deploy` project uses a pipeline to trigger their different stages of deployment. Those stages are, in short, `configure`, `build`, `upload`, `activate`. Plugins installed to the `ember-cli` project have hooks triggered in those stages, where they have a chance to perform their function.

Throughout the pipeline plugins read, write and share state through the so-called `context` object, a hash which can contain raw values and also functions. An example would be the `ember-cli-deploy-build` plugin, which in the `build` step compiles the container `ember-cli` project and writes the resulting array of files to `context.distFiles`. Other plugins then follow to upload those files to s3, Azure or other services.

# Issues

An informal domain model is less suited for a growing ecosystem. Implicit dependencies and decentralized decisions about plugin ordering makes maintaining the ecosystem challanging.

The ecosystem of plugins has grown to a total of 57 by now. They have dependencies on the information and information format put into the `context` object, plus the timing of the hooks:
- if `context.distFiles` would be renamed to `context.files`, all plugins that consume this information would need to be updated.
- if `ember-cli-deploy-revision-data`, a plugin to generate a unique fingerprint for a build, were to move their pipeline hook from `didBuild` (running after `build`) to `prepare` (running between `build` and `upload`), any plugins in `didBuild` and `willPrepare`, before having access to this information, now do not.

With the 57 plugins, many combinations of plugins are possible for a single deployment configuration. One might put together `build`, `revision-data`, `gzip`, `s3-index` and `sentry`. The `sentry` plugin edits `index.html` to add in the `revision-data` hash, so bugs in production can be attributed to the right version. Imagine `index.html` were also gzipped. Should `gzip` take place before or after adding the hash to `index.html`?

The `gzip` plugin enables other plugins to be quite agnostic about whether it ran its operation: all it does is replace the list of distFiles with a list of gzipped files. However, in some cases, the not yet compressed files are also required. Should the `gzip` plugin present this information side by side, or should the output of `build` and `gzip` be distinct, so that plugins could consume what suits them?

The plugin author of each plugin at the moment has to make sure that their plugin assumes the right position in ordering in respect to the other plugins. It is not hard to imagine a scenario where constraints in plugin ordering arise which cannot be satisfied (A depends on B, B depends on C, C depends on A) or a scenario where two use cases exist that require different plugin ordering.

# Proposals

1. If plugins emit what information they would want to consume (files, a minimatch pattern, revision hash, previous deployments) as subscribers on these topics, plus what they could produce as producers on these topics, an automated plugin ordering could be made, also removing the need for set hooks. Context information would be per-topic, passed into the function, instead of globally available.
2. The `ember-cli-deploy` pipeline is written generically, which is a strength. Deployment, however, is a specific domain. Capturing tasks in domain objects such as files, revisions and existing deployments, would help in providing a stable public centralized API which can be reliably consumed.

# Drawbacks

- Many plugins currently rely on the `context` object, new plugins as well as plugins transitioned from the previous data structure in version `0.4`.
- The flexibility of the `context` object disappears largely, so does easy extensibility and adaptability.
- The example of the `gzip`, `sentry` and `s3` plugins is not well solved by either of the two solutions proposed.

# Unresolved questions

- FastBoot and potential needs for provisioning over just deployment have not been considered.
