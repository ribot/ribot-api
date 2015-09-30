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
  }

};


// Export
module.exports = _.extend( commonTests, shared );
