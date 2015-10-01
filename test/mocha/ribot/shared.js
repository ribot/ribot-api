// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

  shouldHaveCheckinsInResponseBody: function() {
    it( 'should have check-ins in response', function() {
      this.response.body.should.have.property( 'checkIns' ).which.is.an.Array().and.has.length( 1 );
    } );
  },

  shouldHaveCheckinsInFirstObject: function() {
    it( 'should have check-ins in response', function() {
      this.response.body[0].should.have.property( 'checkIns' ).which.is.an.Array().and.has.length( 1 );
    } );
  },

  shouldNotHaveCheckinsInResponseBody: function() {
    it( 'should not have check-ins in response', function() {
      this.response.body.should.not.have.property( 'checkIns' );
    } );
  },

  shouldNotHaveCheckinsInFirstObject: function() {
    it( 'should not have check-ins in response', function() {
      this.response.body[0].should.not.have.property( 'checkIns' );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
