// External dependencies


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    ResponseError = require( '../../../app/lib/response-error' );


// Start the tests
describe( 'Venue collections', function( done ) {

  before( function( done ) {
    // Set up db tables and seed
    helpers.db.setupForTests()
      .then( function() {
        done();
      } );
  } );

  describe( 'Get venue collection: /venues', function( done ) {

    before( function() {
      // Needed for blueprint validation
      this.route = '/venues';
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

      before( function( done ) {
        // Set up scope for assertions
        this.expectedStatusCode = 200;

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route,
          headers: {
            'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
          }
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();

    } );

  } );

  describe( 'Get single venue: /venues/{venueId}', function( done ) {

    describe( 'Handle invalid access token', function() {

      before( function() {
        // Needed for blueprint validation
        this.blueprintRoute = '/venues/{venueId}';
        this.route = this.blueprintRoute.replace( /\{venueId\}/g, seed.venue[0].id );
        this.method = 'get';
      } );

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

      describe( 'Handle getting a venue that exists', function() {

        before( function( done ) {
          // Needed for blueprint validation
          this.blueprintRoute = '/venues/{venueId}';
          this.route = this.blueprintRoute.replace( /\{venueId\}/g, seed.venue[0].id );
          this.method = 'get';

          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

      } );

      describe( 'Handle getting a venue that does not exists', function() {

        before( function( done ) {
          // Needed for blueprint validation
          this.blueprintRoute = '/venues/{venueId}';
          this.route = this.blueprintRoute.replace( /\{venueId\}/g, utils.createUuid() );
          this.method = 'get';

          // Set up scope for assertions
          this.expectedStatusCode = 404;
          this.expectedError = new ResponseError( 'notFound' );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            headers: {
                'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
              }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldRespondWithCorrectError();
        shared.shouldReturnValidErrorSchema();

      } );

    } );

  } );

} );
