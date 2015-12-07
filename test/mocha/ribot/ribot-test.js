// External dependencies
var Promise = require( 'bluebird' );

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

    describe( 'Handle consumer without the required scope permissions', function() {

      before( function( done ) {
        // Set up scope for assertions
        this.expectedStatusCode = 403;
        this.expectedError = new ResponseError( 'forbidden' );

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route,
          headers: {
            'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ], seed.consumer[ 1 ] )
          }
        }, done );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

        if ( expectSomeCheckIns ) {
          shared.shouldHaveCheckinsInResponseBody();

          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterOnSecondCheckinsInResponseBody();
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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

        if ( expectSomeCheckIns ) {
          shared.shouldHaveCheckinsInFirstObject();

          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterOnSecondCheckinsInFirstObject();
          }
        } else {
          shared.shouldNotHaveCheckinsInFirstObject();
        }

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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            }
          }, done );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

        if ( expectSomeCheckIns ) {
          shared.shouldHaveCheckinsInResponseBody();

          if ( expectBeaconCheckIns ) {
            shared.shouldHaveBeaconEncounterOnSecondCheckinsInResponseBody();
          }
        } else {
          shared.shouldNotHaveCheckinsInResponseBody();
        }

      } );

    } );

  } );

};


// Start the tests
describe( 'ribot collection', function( done ) {

  describe( 'ribots with no checkins', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          done();
        } );
    } );

    fullRibotRoutesTestSuite( false );

  } );

  describe( 'ribots with non-beacon checkins', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          return new Promise( function( resolve, reject ) {
            helpers.request.bind( this )( {
              method: 'post',
              route: '/check-ins',
              headers: {
                'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            },
            body: {
              venueId: seed.venue[0].id
            }
          }, done );
        } );
    } );

    fullRibotRoutesTestSuite( true );

  } );

  describe( 'ribots with beacon and non-beacon checkins', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          return new Promise( function( resolve, reject ) {
            helpers.request.bind( this )( {
              method: 'post',
              route: '/beacons/' + seed.beacon[ 0 ].id + '/encounters',
              headers: {
                'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
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
              'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
            },
            body: {
              venueId: seed.venue[0].id
            }
          }, done );
        } );
    } );

    fullRibotRoutesTestSuite( true, true );

  } );

} );
