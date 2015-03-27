var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UnknownAdapter = require('../../../../lib/utilities/assets/unknown');

chai.use(chaiAsPromised);

var expect = chai.expect;

describe('UnknownAdapter', function() {
  describe('#upload', function() {
    it('rejects to print out an error message', function(){
      unknown = new UnknownAdapter();
      expect(unknown.upload()).to.be.rejected;
    });
  });
  describe('#activate', function() {
    it('rejects to print out an error message', function(){
      unknown = new UnknownAdapter();
      expect(unknown.activate()).to.be.rejected;
    });
  });
  describe('#list', function() {
    it('rejects to print out an error message', function(){
      unknown = new UnknownAdapter();
      expect(unknown.list()).to.be.rejected;
    });
  });
  describe('#createTag', function() {
    it('rejects to print out an error message', function(){
      unknown = new UnknownAdapter();
      expect(unknown.createTag()).to.be.rejected;
    });
  });
});
