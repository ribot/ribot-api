// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

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

  shouldNotHaveCheckInForUserInDatabase: function shouldNotHaveCheckInForUserInDatabase() {
    it( 'should not have a check-in in the database for the user', function( done ) {
      helpers.db.fetch( 'check_in', { ribot_id: seed.ribot[0].id } )
        .then( function( results ) {
          results.length.should.eql( 0 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  },

  shouldReturnVenueObject: function shouldReturnVenueObject() {
    it( 'should return venue object in response', function() {
      this.response.body.should.have.property( 'venue' );
    } );
  },

  shouldNotReturnVenueObject: function shouldNotReturnVenueObject() {
    it( 'should not return venue object in response', function() {
      this.response.body.should.not.have.property( 'venue' );
    } );
  },

  shouldHaveVenueIdError: function shouldHaveVenueIdError() {
    it( 'should have an error for invalid venue id', function() {
      this.response.body.errors.length.should.eql( 1 );
      this.response.body.errors[0].property.should.eql( 'venueId' );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
