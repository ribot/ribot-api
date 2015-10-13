// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

  shouldHaveCheckinsInResponseBody: function() {
    it( 'should have check-ins in response', function() {
      this.response.body.should.have.property( 'checkIns' ).which.is.an.Array().and.has.length( 2 );
    } );
  },

  shouldHaveCheckinsInFirstObject: function() {
    it( 'should have check-ins in first object', function() {
      this.response.body[0].should.have.property( 'checkIns' ).which.is.an.Array().and.has.length( 2 );
    } );
  },

  shouldNotHaveCheckinsInResponseBody: function() {
    it( 'should not have check-ins in response', function() {
      this.response.body.should.not.have.property( 'checkIns' );
    } );
  },

  shouldNotHaveCheckinsInFirstObject: function() {
    it( 'should not have check-ins in first object', function() {
      this.response.body[0].should.not.have.property( 'checkIns' );
    } );
  },

  shouldHaveBeaconEncounterOnSecondCheckinsInResponseBody: function() {
    it( 'should have beacon encounter in second check-ins in response', function() {
      this.response.body.checkIns[ 1 ].should.have.property( 'beaconEncounters' ).which.is.an.Array().and.has.length( 1 );
    } );
  },

  shouldHaveBeaconEncounterOnSecondCheckinsInFirstObject: function() {
    it( 'should have beacon encounter in second check-ins in first object', function() {
      this.response.body[0].checkIns[ 1 ].should.have.property( 'beaconEncounters' ).which.is.an.Array().and.has.length( 1 );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
