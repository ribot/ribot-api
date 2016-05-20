// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

  shouldNotHaveInactiveRibotsInResponseBody: function() {
    it( 'should not have inactive ribots in response body', function() {
      _.every( this.response.body, function( ribot ) {
        return ribot.profile.isActive;
      } ).should.be.true;
    } );
  },

  shouldHaveCheckInInResponseBody: function() {
    it( 'should have check-ins', function() {
      this.response.body.should.have.property( 'latestCheckIn' );
    } );
  },

  shouldHaveCheckinsInFirstObject: function() {
    it( 'should have check-ins in first item', function() {
      this.response.body[ 0 ].should.have.property( 'latestCheckIn' );
    } );
  },

  shouldNotHaveCheckinsInResponseBody: function() {
    it( 'should not have check-ins', function() {
      this.response.body.should.not.have.property( 'latestCheckIn' );
    } );
  },

  shouldNotHaveCheckinsInFirstObject: function() {
    it( 'should not have check-ins in first item', function() {
      this.response.body[ 0 ].should.not.have.property( 'latestCheckIn' );
    } );
  },

  shouldHaveBeaconEncounterInCheckIn: function() {
    it( 'should have beacon encounter in latest check-in', function() {
      this.response.body.latestCheckIn.should.have.property( 'latestBeaconEncounter' );
    } );
  },

  shouldHaveBeaconEncounterInCheckInInFirstObject: function() {
    it( 'should have beacon encounter in latest check-in', function() {
      this.response.body[ 0 ].latestCheckIn.should.have.property( 'latestBeaconEncounter' );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
