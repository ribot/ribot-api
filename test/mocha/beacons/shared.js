// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

  shouldHaveSingleBeaconEncounter: function shouldHaveSingleBeaconEncounter() {
    it( 'should have a single becaon encounter in the database', function( done ) {
      helpers.db.fetch( 'beacon_encounter' )
        .then( function( results ) {
          results.length.should.eql( 1 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  },

  shouldHaveNoBeaconEncounters: function shouldHaveNoBeaconEncounters() {
    it( 'should have no becaon encounters in the database', function( done ) {
      helpers.db.fetch( 'beacon_encounter' )
        .then( function( results ) {
          results.length.should.eql( 0 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  },

  shouldHaveSingleCheckInForUserInDatabase: function shouldHaveSingleCheckInForUserInDatabase() {
    it( 'should have a single check-in in the database for the user', function( done ) {
      helpers.db.fetch( 'check_in', { ribot_id: seed.ribot[0].id } )
        .then( function( results ) {
          results.length.should.eql( 1 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  },

  shouldHaveTwoCheckInsForUserInDatabase: function shouldHaveSingleCheckInForUserInDatabase() {
    it( 'should have two check-ins in the database for the user', function( done ) {
      helpers.db.fetch( 'check_in', { ribot_id: seed.ribot[0].id } )
        .then( function( results ) {
          results.length.should.eql( 2 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
