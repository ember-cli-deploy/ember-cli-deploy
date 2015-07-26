# Ember CLI Deploy - Documentation

The docs site is a [Jekyll](http://jekyllrb.com/) site. To update, just push new code to the `gh-pages` branch; no need to build, GitHub Pages will do that for us.

## Local development

```sh
bundle install
bundle exec jekyll serve --watch --baseurl ''
```

Now, visit `localhost:4000`.

## To author a new version of docs

1. Update `/_data/navs.yml` with your Table of Contents
2. Update `_config.yml`, the `defaults` key, with your new version
3. Copy the previous version of docs under `/docs` to a new directory named the new version
4. Start writing!

