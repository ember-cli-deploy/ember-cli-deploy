var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UnknownAdapter = require('../../../../utilities/assets/unknown');

chai.use(chaiAsPromised);

var expect = chai.expect;

describe('UnknownAdapter', function() {
  describe('#upload', function() {
    it('rejects to print out an error message', function(){
      unknown = new UnknownAdapter();
      expect(unknown.upload()).to.be.rejected;
    });
  })
});
