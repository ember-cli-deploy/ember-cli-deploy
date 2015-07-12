# ember-cli-deploy Changelog

### 0.4.3 (July 12, 2015)

This release fixes problems with the silent-error package used by
`ember-cli-deploy` internally, brings improvements for the activate task and
makes it possible to configure the build path that `ember-cli-deploy` uses to
store files before uploading.

Thanks to everyone who took time to contribute to this release!

#### Community Contributions

- [#156](https://github.com/ember-cli/ember-cli-deploy/pull/156) Fix `_materialize` using wrong this context [@jeffhertzler](https://github.com/jeffhertzler)
- [#158](https://github.com/ember-cli/ember-cli-deploy/pull/158) added ember-cli-rest-index adapter to list of adapter [@leojh](https://github.com/leojh)
- [#159](https://github.com/ember-cli/ember-cli-deploy/pull/159) Update video link in README. [@blimmer](https://github.com/blimmer)
- [#161](https://github.com/ember-cli/ember-cli-deploy/pull/161) Remove leading '+' es from code of conduct [@pangratz](https://github.com/pangratz)
- [#164](https://github.com/ember-cli/ember-cli-deploy/pull/164) [#151] read manifestPrefix from config [@pavloo](https://github.com/pavloo)
- [#170](https://github.com/ember-cli/ember-cli-deploy/pull/170) Add ability to configure build paths, defaulting to tmp/deploy-dist/. [@duizendnegen/feature](https://github.com/duizendnegen/feature)
- [#171](https://github.com/ember-cli/ember-cli-deploy/pull/171) Update ember cli 0.2.7 and fix npm warnings [@ghedamat](https://github.com/ghedamat)
- [#175](https://github.com/ember-cli/ember-cli-deploy/pull/175) Manifest prefix for activate task. [@juggy](https://github.com/juggy)
- [#176](https://github.com/ember-cli/ember-cli-deploy/pull/176) Use silent-error NPM Package [@jherdman](https://github.com/jherdman)
- [#178](https://github.com/ember-cli/ember-cli-deploy/pull/178) Use SilentError to log errors when parsing config. [@ember-cli](https://github.com/ember-cli)

Thank you to all who took the time to contribute!

### 0.4.2 (June 14, 2015)

This release fixes asset upload issues with io.js, adds the possibility for
index adapters to support multiple files and adds a configuration option to
exclude asset files from deployment.

#### Community Contributions

- [#140](https://github.com/ember-cli/ember-cli-deploy/pull/140) Link to ember-deploy-couchbase. [@waltznetworks](https://github.com/waltznetworks)
- [#113](https://github.com/ember-cli/ember-cli-deploy/pull/113) Provide better error support for missing environment config [@achambers](https://github.com/achambers)
- [#115](https://github.com/ember-cli/ember-cli-deploy/pull/115) Changed package to be able to run tests on windows. [@Twinkletoes](https://github.com/Twinkletoes)
- [#119](https://github.com/ember-cli/ember-cli-deploy/pull/119) Stub active, list, createTag UnknownAdapter methods [@waltznetworks](https://github.com/waltznetworks)
- [#120](https://github.com/ember-cli/ember-cli-deploy/pull/120) [DOCUMENTATION] Make Sinatra example a bit more secure [@elucid](https://github.com/elucid)
- [#124](https://github.com/ember-cli/ember-cli-deploy/pull/124) Index Adapter support for multiple files [@Ahalogy](https://github.com/Ahalogy)
- [#128](https://github.com/ember-cli/ember-cli-deploy/pull/128) Link to custom adapters section for quick ref [@jayphelps](https://github.com/jayphelps)
- [#129](https://github.com/ember-cli/ember-cli-deploy/pull/129) Make a callout easily actionable [@jorgedavila25](https://github.com/jorgedavila25)
- [#141](https://github.com/ember-cli/ember-cli-deploy/pull/141) Add configuration option to exclude asset files from being deployed. [@yapplabs](https://github.com/yapplabs)
- [#142](https://github.com/ember-cli/ember-cli-deploy/pull/142) Test against stable node versions [@yapplabs](https://github.com/yapplabs)
- [#144](https://github.com/ember-cli/ember-cli-deploy/pull/144) Resolve JSHint error on deploy.js blueprint [@blimmer](https://github.com/blimmer)
- [#146](https://github.com/ember-cli/ember-cli-deploy/pull/146) Make io.js work [@trym](https://github.com/trym)

Thank you to all who took the time to contribute!

### 0.4.1 (March 13, 2015)

This release mainly revolves round fixing a bug around `child_process` and `execSync` compatability among the nodejs versions and platforms.

#### Community Contributions

- [#93](https://github.com/ember-cli/ember-cli-deploy/pull/93) [BUGFIX] execSync compat issue #92 [@joebartels](https://github.com/joebartels)
- [#100](https://github.com/ember-cli/ember-cli-deploy/pull/100) [DOCS] Update config around production-like environments [@Soliah](https://github.com/Soliah)

### 0.4.0 (March 07, 2015)

This release marks the merge of `achambers/ember-cli-deploy`, `LevelBossMike/ember-deploy` and `tedconf/ember-cli-front-end-builds` into the official `ember-cli-deploy`

If you are upgrading from `achambers/ember-cli-deploy v0.0.6`, please follow these [miragtion steps](https://github.com/ember-cli/ember-cli-deploy/blob/master/MIGRATION_STEPS.md);

#### Community Contributions

- [#33](https://github.com/ember-cli/ember-cli-deploy/pull/33) [DOCS] Link to new S3 Index Adapter [@pootsbook](https://github.com/pootsbook)
- [#65](https://github.com/ember-cli/ember-cli-deploy/pull/65) [DOCS] Update CodeClimate batch. [@LevelbossMike](https://github.com/LevelbossMike)
- [#35](https://github.com/ember-cli/ember-cli-deploy/pull/35) [ENHANCEMENT] Match ember-cli's build command aliases by supporting --prod and --dev [@jamesfid](https://github.com/jamesfid)
- [#36](https://github.com/ember-cli/ember-cli-deploy/pull/36) [ENHANCEMENT] Allow custom config file via --deploy-config-file. [@yapplabs](https://github.com/yapplabs)
- [#63](https://github.com/ember-cli/ember-cli-deploy/pull/63) [BUGFIX] Fix regression to the type of object that was being passed to assets adapters as “config”. [@yapplabs](https://github.com/yapplabs)
- [#56](https://github.com/ember-cli/ember-cli-deploy/pull/56) [BREAKING ENHANCEMENT] Deprecated commands no longer needed. [@ember-cli](https://github.com/ember-cli)
- [#40](https://github.com/ember-cli/ember-cli-deploy/pull/40) [BUGFIX] Removed erroneous conflict markers. [@jamesfid](https://github.com/jamesfid)
- [#58](https://github.com/ember-cli/ember-cli-deploy/pull/58) [ENHANCEMENT] Add blueprint to auto generate config/deploy.js [@ember-cli](https://github.com/ember-cli)
- [#57](https://github.com/ember-cli/ember-cli-deploy/pull/57) [DEPRECATION] Deprecate use of deploy.json in favor of config/deploy.js. Closes #51 [@yapplabs](https://github.com/yapplabs)
- [#66](https://github.com/ember-cli/ember-cli-deploy/pull/66) [DOCS] Add note for fingerprint.prepend and staging envs. [@LevelbossMike](https://github.com/LevelbossMike)
- [#74](https://github.com/ember-cli/ember-cli-deploy/pull/74) [BREAKING DEPRECATION] Revert Unsupported Commands back to Deprecated for 0.4.0 release [@danshultz](https://github.com/danshultz)
- [#85](https://github.com/ember-cli/ember-cli-deploy/pull/85) [DEPRECATION] npm post install message for users of v0.0.6 [@achambers](https://github.com/achambers)

### 0.3.1 (February 08, 2015)

- [#32](https://github.com/LevelbossMike/ember-deploy/pull/32) add support for execSync in node >= 0.11 [@kriswill](https://github.com/kriswill)
