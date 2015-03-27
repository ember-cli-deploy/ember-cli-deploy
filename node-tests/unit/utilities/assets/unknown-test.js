var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UnknownAdapter = require('../../../../lib/utilities/assets/unknown');

chai.use(chaiAsPromised);

var expect = chai.expect;

var methodTest = function(adapter, method) {
  return function() {
    it('rejects to print out an error message', function() {
      expect(adapter[method]()).to.be.rejected;
    });
  };
}

describe('UnknownAdapter', function() {
  var adapter = new UnknownAdapter();

  describe('#upload', methodTest(adapter, "upload"));
  describe('#activate', methodTest(adapter, "activate"));
  describe('#list', methodTest(adapter, "list"));
  describe('#createTag', methodTest(adapter, "createTag"));
});
