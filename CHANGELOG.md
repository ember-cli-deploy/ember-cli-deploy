# ember-cli-deploy Changelog

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
