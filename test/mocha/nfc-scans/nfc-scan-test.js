// External dependencies
var moment = require( 'moment' ),
    _ = require( 'lodash' );


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( '../helpers/shared' ),
    ResponseError = require( '../../../app/lib/response-error' );


// Start the tests
describe( 'NFC scans', function( done ) {

  describe( 'Register NFC scan: /nfc-scans', function() {

    before( function() {
      this.blueprintRoute = '/nfc-scans';
      this.route = this.blueprintRoute;
      this.method = 'post';
    } );

    describe( 'Handle invalid NFC scan data', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedError = new ResponseError( 'invalidData' );
            this.expectedStatusCode = this.expectedError.statusCode;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              body: {
                context: 'drink',
                uid: '123'
              }
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle valid NFC scan data', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {

            this.nfcTag = seed.nfc_tag[ 0 ];

            this.requestBody = {
              context: 'drink',
              uid: this.nfcTag.uid
            };

            // Set up scope for assertions
            this.expectedStatusCode = 201;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              body: this.requestBody
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();

      it( 'should have the drink in the database', function( done ) {
        helpers.db.fetch( 'drink', { ribot_id: this.nfcTag.ribot_id } )
          .bind( this )
          .then( function( results ) {
            var seedDrinks = _.filter( seed.drink, { ribot_id: this.nfcTag.ribot_id } );
            results.length.should.eql( seedDrinks.length + 1 );
            done();
          } )
          .catch( function( error ) {
            done( error );
          } );
      } );

    } );

  } );

} );
