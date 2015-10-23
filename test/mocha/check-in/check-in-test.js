// External dependencies
var hat = require( 'hat' );


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    fixtures = require( './fixtures' ),
    ResponseError = require( '../../../app/lib/response-error' );


// Helper functions
var testWithValidAndInvalidAccessTokensAndBody = function testWithValidAndInvalidAccessTokensAndBody( requestBody, requiresVenue ) {
  describe( 'Handle invalid access token', function( done ) {
    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          // Set up scope for assertions
          this.expectedStatusCode = 401;
          this.expectedError = new ResponseError( 'unauthorized' );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            body: requestBody
          }, done );
        }.bind( this ) );
    } );

    shared.shouldRespondWithCorrectStatusCode();
    shared.shouldRespondWithCorrectError();
    shared.shouldNotHaveCheckInForUserInDatabase();
    shared.shouldReturnValidErrorSchema();
  } );

  describe( 'Handle user with valid access token', function( done ) {
    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          // Set up scope for assertions
          this.expectedStatusCode = 201;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            },
            body: requestBody
          }, done );
        }.bind( this ) );
    } );

    shared.shouldRespondWithCorrectStatusCode();
    shared.shouldHaveSingleCheckInForUserInDatabase();
    shared.shouldReturnValidResponseSchema();

    if ( requiresVenue ) {
      shared.shouldReturnVenueObject();
    } else {
      shared.shouldNotReturnVenueObject();
    }
  } );
};

var testInvalidDataErrorWithBody = function testInvalidDataErrorWithBody( requestBody ) {
  before( function( done ) {
    // Set up db tables and seed
    helpers.db.setupForTests()
      .then( function() {
        // Set up scope for assertions
        this.expectedStatusCode = 400;
        this.expectedError = new ResponseError( 'invalidData' );

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route,
          headers: {
            'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
          },
          body: requestBody
        }, done );
      }.bind( this ) );
  } );

  shared.shouldRespondWithCorrectStatusCode();
  shared.shouldRespondWithCorrectError();
  shared.shouldNotHaveCheckInForUserInDatabase();
  shared.shouldReturnValidErrorSchema();
};


// Start the tests
describe( 'Check-in', function( done ) {

  describe( 'Perform Check-in: /check-ins', function( done ) {

    before( function() {

      // Needed for blueprint validation
      this.route = '/check-ins';
      this.method = 'post';

    } );

    describe( 'Handle with just label', function( done ) {
      testWithValidAndInvalidAccessTokensAndBody( fixtures.performCheckInBodyWithLabel );
    } );

    describe( 'Hanel with label and coordinates', function( done ) {
      testWithValidAndInvalidAccessTokensAndBody( fixtures.performCheckInBodyWithAndLocation );
    } );

    describe( 'Handle with no label', function( done ) {
      testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidLabel );
    } );

    describe( 'Check with label and invalid coordinates', function( done ) {

      describe( 'Handle only latitude', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyOnlyLatitude );
      });

      describe( 'Handle only longitude', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyOnlyLongitude );
      });

      describe( 'Handle invalid latitude (low)', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidLatitudeLow );
      });

      describe( 'Handle invalid latitude (high)', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidLatitudeHigh );
      });

      describe( 'Handle invalid longitude (low)', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidLongitudeLow );
      });

      describe( 'Handle invalid longitude (high)', function( done ) {
        testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidLongitudeHigh );
      });

    } );

    describe( 'Handle with additional properties', function( done ) {
      testInvalidDataErrorWithBody( fixtures.performCheckInBodyInvalidExtraProperty );
    } );

    describe( 'Handle with valid venue id', function( done ) {
      testWithValidAndInvalidAccessTokensAndBody( fixtures.performCheckInBodyWithVenueId, true );
    } );

    describe( 'Handle with invalid venue id', function( done ) {
      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 400;
            this.expectedError = new ResponseError( 'invalidData' );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
              },
              body: fixtures.performCheckInBodyWithInvalidVenueId
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldNotHaveCheckInForUserInDatabase();
      shared.shouldReturnValidErrorSchema();
      shared.shouldHaveVenueIdError();
    } );

  } );

  describe( 'Modify Check-in: PUT /check-ins/{checkInId}', function() {

    before( function() {

      this.blueprintRoute = '/check-ins/{checkInId}';
      this.method = 'put';

    } );

    describe( 'Handle no access token', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{checkInId\}/g, seed.check_in[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 401;
            this.expectedError = new ResponseError( 'unauthorized' );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              body: fixtures.performCheckOutBody
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldNotHaveCheckInForUserInDatabase();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle unknown check-in ID', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{checkInId\}/g, hat() );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 404;
            this.expectedError = new ResponseError( 'notFound' );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 1 ].token )
              },
              body: fixtures.performCheckOutBody
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldNotHaveCheckInForUserInDatabase();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle incorrect user access token', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{checkInId\}/g, seed.check_in[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 404;
            this.expectedError = new ResponseError( 'notFound' );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
              },
              body: fixtures.performCheckOutBody
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldNotHaveCheckInForUserInDatabase();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle attempting to modify incorrect attributes', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{checkInId\}/g, seed.check_in[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 400;
            this.expectedError = new ResponseError( 'invalidData' );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 1 ].token )
              },
              body: fixtures.performCheckOutBodyInvalid
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldNotHaveCheckInForUserInDatabase();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle valid request', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{checkInId\}/g, seed.check_in[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            this.expectedStatusCode = 200;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 1 ].token )
              },
              body: fixtures.performCheckOutBody
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldReturnCheckedOutCheckIn();
      shared.shouldHaveCheckedOutDateInTheDatabase();

    } );

  } );

} );
