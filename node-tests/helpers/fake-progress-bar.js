function FakeProgressBar(template, options) {
  this.template = template;
  this.total = options.total;
  this.ticks = [];
}

FakeProgressBar.prototype.tick = function(options) {
  this.ticks.push(options);
};

module.exports = FakeProgressBar;
