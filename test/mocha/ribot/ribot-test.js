// External dependencies
var hat = require( 'hat' ),
    Promise = require( 'bluebird' );

// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    ResponseError = require( '../../../app/lib/response-error' );


// Start the tests
describe( 'ribot collection', function( done ) {

  before( function( done ) {
    // Set up db tables and seed
    helpers.db.setupForTests()
      .then( function() {
        return new Promise( function( resolve, reject ) {
          helpers.request.bind( this )( {
            method: 'post',
            route: '/check-ins',
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            },
            body: {
              label: 'Home'
            }
          }, function( err ) {
            if ( err ) {
              return reject( err );
            } else {
              return resolve();
            }
          } );
        } );
      } )
      .then( function() {
        helpers.request.bind( this )( {
          method: 'post',
          route: '/check-ins',
          headers: {
            'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
          },
          body: {
            venueId: seed.venue[0].id
          }
        }, done );
      } );
  } );

  describe( 'Get authenticated ribot: /ribots/me', function( done ) {

    before( function() {
      // Needed for blueprint validation
      this.route = '/ribots/me';
      this.method = 'get';
    } );

    describe( 'Handle invalid access token', function() {

      before( function( done ) {
        // Set up scope for assertions
        this.expectedStatusCode = 401;
        this.expectedError = new ResponseError( 'unauthorized' );

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle valid access token', function() {

      describe( 'Handle just ribot profile', function() {
        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldNotHaveCheckinsInResponseBody();

      } );

      describe( 'Handle profile with checkins', function() {
        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            query: {
              embed: 'checkins'
            },
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldHaveCheckinsInResponseBody();

      } );

    } );

  } );

  describe( 'Get collection of ribots: /ribots', function( done ) {

    before( function() {
      // Needed for blueprint validation
      this.route = '/ribots';
      this.method = 'get';
    } );

    describe( 'Handle getting just the ribots', function() {

      before( function( done ) {
        // Set up scope for assertions
        this.expectedStatusCode = 200;

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldNotHaveCheckinsInFirstObject();

    } );

    describe( 'Get ribots with checkins', function() {

      describe( 'Handle invalid access token', function() {

        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 401;
          this.expectedError = new ResponseError( 'unauthorized' );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            query: {
              embed: 'checkins'
            },
            route: this.route
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldRespondWithCorrectError();
        shared.shouldReturnValidErrorSchema();

      } );

      describe( 'Handle valid access token', function() {

        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            query: {
              embed: 'checkins'
            },
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldHaveCheckinsInFirstObject();

      } );

    } );

  } );

  describe( 'Get single ribot: /ribots/:ribotId', function( done ) {

    describe( 'Handle getting just the ribots', function() {

      before( function( done ) {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, seed.ribot[0].id );
        this.method = 'get';

        // Set up scope for assertions
        this.expectedStatusCode = 200;

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();
      shared.shouldNotHaveCheckinsInResponseBody();

    } );

    describe( 'Handle getting invalid ribots', function() {

      before( function( done ) {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, hat() );
        this.method = 'get';

        // Set up scope for assertions
        this.expectedStatusCode = 404;
        this.expectedError = new ResponseError( 'notFound' );

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Get ribot with checkins', function() {

      before( function() {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, seed.ribot[0].id );
        this.method = 'get';
      } );

      describe( 'Handle invalid access token', function() {

        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 401;
          this.expectedError = new ResponseError( 'unauthorized' );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            query: {
              embed: 'checkins'
            },
            route: this.route
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldRespondWithCorrectError();
        shared.shouldReturnValidErrorSchema();

      } );

      describe( 'Handle valid access token', function() {

        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            query: {
              embed: 'checkins'
            },
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[0].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldHaveCheckinsInResponseBody();

      } );

    } );

  } );

} );
