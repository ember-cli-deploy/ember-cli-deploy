---
title: Example Sinatra app
---

This is a small sinatra application that can be used to serve an Ember-CLI application deployed with the help of `ember-cli-deploy` and `ember-deploy-redis`.

```ruby
require 'sinatra'
require 'redis'

get '/' do
  content_type 'text/html'
  
  redis = Redis.new
  index_key = redis.get("<your-project-name>:current")
  index_key = "<your-project-name>:#{params[:index_key]}" if params[:index_key]
  redis.get(index_key)
end
```

The nice thing about this is that you can deploy your app to production, test it out by passing an index_key parameter with the revision you want to test and activate when you feel confident that everything is working as expected.
