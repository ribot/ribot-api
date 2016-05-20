// External dependencies
var Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    ResponseError = require( '../../../app/lib/response-error' );


/**
 * This funcation will run a full test suite through all the ribot routes. Before calling it you
 * should set up the database in the format you want to test
 */
var fullRibotRoutesTestSuite = function fullRibotRoutesTestSuite( expectSomeCheckIns, expectBeaconCheckIns ) {

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
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldNotHaveCheckinsInResponseBody();

      } );

      describe( 'Handle profile with check-ins', function() {
        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 200;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            query: {
              embed: 'latestCheckIn'
            },
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

        if ( expectSomeCheckIns || expectBeaconCheckIns ) {
          if ( expectSomeCheckIns ) {
            shared.shouldHaveCheckInInResponseBody();
          }
          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterInCheckIn();
          }
        } else {
          shared.shouldNotHaveCheckinsInResponseBody();
        }

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
      shared.shouldNotHaveInactiveRibotsInResponseBody();

    } );

    describe( 'Get ribots with check-ins', function() {

      describe( 'Handle invalid access token', function() {

        before( function( done ) {
          // Set up scope for assertions
          this.expectedStatusCode = 401;
          this.expectedError = new ResponseError( 'unauthorized' );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            query: {
              embed: 'latestCheckIn'
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
              embed: 'latestCheckIn'
            },
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();
        shared.shouldNotHaveInactiveRibotsInResponseBody();

        if ( expectSomeCheckIns || expectBeaconCheckIns ) {
          if ( expectSomeCheckIns ) {
            shared.shouldHaveCheckinsInFirstObject();
          }
          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterInCheckInInFirstObject();
          }
        } else {
          shared.shouldNotHaveCheckinsInFirstObject();
        }

      } );

    } );

  } );

  describe( 'Get single ribot: /ribots/:ribotId', function( done ) {

    describe( 'Handle getting just the ribot', function() {

      before( function( done ) {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, seed.ribot[ 0 ].id );
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

    describe( 'Handle getting inactive ribot', function() {

      before( function( done ) {

        this.inactiveRibot = _.findWhere( seed.ribot, { is_active: false } );

        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, this.inactiveRibot.id );
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

    describe( 'Handle getting invalid ribot', function() {

      before( function( done ) {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, utils.createUuid() );
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

    describe( 'Get ribot with check-ins', function() {

      before( function() {
        // Needed for blueprint validation
        this.blueprintRoute = '/ribots/{ribotId}';
        this.route = this.blueprintRoute.replace( /\{ribotId\}/g, seed.ribot[ 0 ].id );
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
              embed: 'latestCheckIn'
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
              embed: 'latestCheckIn'
            },
            route: this.route,
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

        if ( expectSomeCheckIns || expectBeaconCheckIns ) {
          if ( expectSomeCheckIns ) {
            shared.shouldHaveCheckInInResponseBody();
          }
          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterInCheckIn();
          }
        } else {
          shared.shouldNotHaveCheckinsInResponseBody();
        }

      } );

    } );

  } );

};


// Start the tests
describe( 'ribot resource', function( done ) {

  describe( 'ribots with no check-ins', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          done();
        } );
    } );

    fullRibotRoutesTestSuite();

  } );

  describe( 'ribots with non-beacon check-in', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          helpers.request.bind( this )( {
            method: 'post',
            route: '/check-ins',
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            },
            body: {
              venueId: seed.venue[ 0 ].id
            }
          }, done );
        } );
    } );

    fullRibotRoutesTestSuite( true );

  } );

  describe( 'ribots with beacon check-in', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          helpers.request.bind( this )( {
            method: 'post',
            route: '/beacons/' + seed.beacon[ 0 ].id + '/encounters',
            headers: {
              'Authorization': 'Bearer ' + utils.decodeToken( seed.access_token[ 0 ].token )
            }
          }, done );
        } );
    } );

    fullRibotRoutesTestSuite( false, true );

  } );

} );
