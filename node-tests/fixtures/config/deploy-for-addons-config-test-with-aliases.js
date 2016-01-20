module.exports = function(/* environment */) {
  return {
    plugins: ['foo-plugin', 'foo-plugin:bar-alias', 'foo-plugin:doo-alias']
  };
};
