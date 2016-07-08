---
title: Other API/Classes
---

## Changing log colors

The color of log messages (i.e. when running with `--verbose`) can be customized either by passing the following command line options:

```
ember deploy --log-info-color=yellow --log-error-color=green
```

Or by setting the configuration in `.ember-cli`

```javascript
// .ember-cli
{
  "ember-cli-deploy": {
    log-info-color: 'blue',
    log-error-color: 'red'
  }
}
```

Default values are `blue` for log messages and `red` for errors.
