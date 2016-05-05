// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    seed = require( '../../../data/seed' );


// Exported object
var shared = {

  shouldHaveDrinksInResponse: function shouldHaveDrinksInResponse() {
    it( 'should have the correct drinks in the response', function() {
      var hasRecords = _.every( this.expectedRecords, function( item ) {
        return _.find( this.response.body, function( responseItem ) {
          return item.id == responseItem.id;
        } );
      }.bind( this ) );

      this.response.body.length.should.eql( this.expectedRecords.length );
      hasRecords.should.be.true;

    } );
  },

  shouldHaveDrinkInDatabase: function shouldHaveDrinkInDatabase() {
    it( 'should have the drink in the database', function( done ) {
      helpers.db.fetch( 'drink', { id: this.response.body.id } )
        .bind( this )
        .then( function( results ) {
          results.length.should.eql( 1 );
          results[ 0 ].should.have.properties( this.requestBody );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );
  },

  shouldNotHaveDrinkInDatabase: function shouldNotHaveDrinkInDatabase( query ) {
    it( 'should not have the drink in the database', function( done ) {
      helpers.db.fetch( 'drink', query )
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
