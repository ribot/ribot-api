// External dependencies
var moment = require( 'moment' ),
    _ = require( 'lodash' );


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    ResponseError = require( '../../../app/lib/response-error' ),
    CheckIn = require( '../../../app/models/check-in' );


// Start the tests
describe( 'Drinks', function( done ) {

  describe( 'Drinks collection: /drinks', function() {

    before( function() {
      this.blueprintRoute = '/drinks';
      this.route = this.blueprintRoute;
      this.method = 'get';
    } );

    describe( 'Retrieve drinks', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 200;
            this.expectedRecords = seed.drink;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinksInResponse();

    } );

    describe( 'Retrieve drinks by specific ribot', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            var query = {
              ribotId: seed.ribot[ 0 ].id
            };

            // Set up scope for assertions
            this.expectedStatusCode = 200;
            this.expectedRecords = _.filter( seed.drink, function( record ) {
              return record.ribot_id == query.ribotId;
            } );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              query: query
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinksInResponse();

    } );

    describe( 'Retrieve drinks after given date', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            var query = {
              dateFrom: moment().subtract( 1, 'hours' ).format()
            };

            // Set up scope for assertions
            this.expectedStatusCode = 200;
            this.expectedRecords = _.filter( seed.drink, function( record ) {
              return moment( record.created_date ).isAfter( query.dateFrom );
            } );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              query: query
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinksInResponse();

    } );

    describe( 'Retrieve drinks before given date', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            var query = {
              dateTo: moment().subtract( 1, 'hours' ).format()
            };

            // Set up scope for assertions
            this.expectedStatusCode = 200;
            this.expectedRecords = _.filter( seed.drink, function( record ) {
              return moment( record.created_date ).isBefore( query.dateTo );
            } );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              query: query
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinksInResponse();

    } );

    describe( 'Retrieve drinks within date range', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            var query = {
              dateFrom: moment().subtract( 3, 'days' ).format(),
              dateTo: moment().subtract( 1, 'days' ).format()
            };

            // Set up scope for assertions
            this.expectedStatusCode = 200;
            this.expectedRecords = _.filter( seed.drink, function( record ) {
              return moment( record.created_date ).isAfter( query.dateFrom ) && moment( record.created_date ).isBefore( query.dateTo );
            } );

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              query: query
            }, done );

          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinksInResponse();

    } );

  } );

  describe( 'Single drink: /drinks/:drinkId', function() {

    before( function() {
      this.blueprintRoute = '/drinks/{drinkId}';
      this.method = 'get';
    } );

    describe( 'Handle invalid drink UUID', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{drinkId\}/g, utils.createUuid() );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedError = new ResponseError( 'notFound' );
            this.expectedStatusCode = this.expectedError.statusCode;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle valid drink UUID', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{drinkId\}/g, seed.drink[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 200;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();

    } );

  } );

  describe( 'Create drink: /drinks', function() {

    before( function() {
      this.blueprintRoute = '/drinks';
      this.route = this.blueprintRoute;
      this.method = 'post';
    } );

    describe( 'Handle invalid access token', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedError = new ResponseError( 'unauthorized' );
            this.expectedStatusCode = this.expectedError.statusCode;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              body: {
                type: 'water',
                volume: 123
              }
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();
      shared.shouldNotHaveDrinkInDatabase( { volume: 123 } );

    } );

    describe( 'Handle invalid drink data', function() {

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
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
              },
              body: {
                invalidType: 'White Russian',
                volume: 123
              }
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();
      shared.shouldNotHaveDrinkInDatabase( { volume: 123 } );

    } );

    describe( 'Handle valid drink data', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {

            this.requestBody = {
              type: 'water',
              volume: 150
            };

            // Set up scope for assertions
            this.expectedStatusCode = 201;

            // Make request
            helpers.request.bind( this )( {
              method: this.method,
              route: this.route,
              headers: {
                'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
              },
              body: this.requestBody
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldHaveDrinkInDatabase();

    } );

  } );

} );
