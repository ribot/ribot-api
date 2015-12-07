// External dependencies
var moment = require( 'moment' );


// Dependencies
var seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    helpers = require( '../helpers' ),
    shared = require( './shared' ),
    fixtures = require( './fixtures' ),
    ResponseError = require( '../../../app/lib/response-error' ),
    CheckIn = require( '../../../app/models/check-in' );


// Start the tests
describe( 'Beacons', function( done ) {

  describe( 'Beacons collection: /beacons', function() {

    before( function() {
      this.route = '/beacons';
      this.method = 'get';
    } );

    describe( 'Handle invalid access token', function() {

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
              route: this.route
            }, done );
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();

    } );

    describe( 'Handle valid access token', function() {

      before( function( done ) {
        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
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
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldReturnValidResponseSchema();

    } );

  } );

  describe( 'Single beacon: /beacons/:beaconUuid', function() {

    before( function() {
      this.blueprintRoute = '/beacons/{beaconUuid}';
      this.method = 'get';
    } );

    describe( 'Handle invalid access token', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, seed.beacon[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 401;
            this.expectedError = new ResponseError( 'unauthorized' );

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

    describe( 'Handle valid access token', function() {

      describe( 'Handle invalid beacon UUID', function() {

        before( function( done ) {
          this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, utils.createUuid() );

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
                  'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                }
              }, done );
            }.bind( this ) );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldRespondWithCorrectError();
        shared.shouldReturnValidErrorSchema();

      } );

      describe( 'Handle valid beacon UUID', function() {

        before( function( done ) {
          this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, seed.beacon[ 0 ].id );

          // Set up db tables and seed
          helpers.db.setupForTests()
            .then( function() {
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
            }.bind( this ) );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnValidResponseSchema();

      } );

    } );

  } );

  describe( 'Create beacon encounter: /beacons/:beaconUuid/encounters', function() {

    before( function() {
      this.blueprintRoute = '/beacons/{beaconUuid}/encounters';
      this.method = 'post';
    } );

    describe( 'Handle consumer without the required scope permissions', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, seed.beacon[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
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
          }.bind( this ) );
      } );

      shared.shouldRespondWithCorrectStatusCode();
      shared.shouldRespondWithCorrectError();
      shared.shouldReturnValidErrorSchema();
      shared.shouldHaveNoBeaconEncounters();

    } );

    describe( 'Handle invalid access token', function() {

      before( function( done ) {
        this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, seed.beacon[ 0 ].id );

        // Set up db tables and seed
        helpers.db.setupForTests()
          .then( function() {
            // Set up scope for assertions
            this.expectedStatusCode = 401;
            this.expectedError = new ResponseError( 'unauthorized' );

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
      shared.shouldHaveNoBeaconEncounters();

    } );

    describe( 'Handle valid access token', function() {

      describe( 'Handle invalid beacon UUID', function() {

        before( function( done ) {
          this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, utils.createUuid() );

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
                  'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                }
              }, done );
            }.bind( this ) );
        } );

        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldRespondWithCorrectError();
        shared.shouldReturnValidErrorSchema();
        shared.shouldHaveNoBeaconEncounters();

      } );

      describe( 'Handle valid beacon UUID', function() {

        before( function() {
            this.route = this.blueprintRoute.replace( /\{beaconUuid\}/g, seed.beacon[ 0 ].id );
        } );

        describe( 'Handle no previous check-in', function() {

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
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveSingleCheckInForUserInDatabase();

        } );

        describe( 'Handle previous check-in with same venue id', function() {

          before( function( done ) {
            // Set up db tables and seed
            helpers.db.setupForTests()
              .then( function() {
                return new CheckIn( {
                  venueId: seed.venue[ 1 ].id,
                  ribotId: seed.ribot[ 0 ].id
                } ).save();
              } )
              .then( function() {
                // Set up scope for assertions
                this.expectedStatusCode = 201;

                // Make request
                helpers.request.bind( this )( {
                  method: this.method,
                  route: this.route,
                  headers: {
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveSingleCheckInForUserInDatabase();

        } );

        describe( 'Handle previous check-in with correct venue id, but with checked-out date', function() {

          before( function( done ) {
            // Set up db tables and seed
            helpers.db.setupForTests()
              .then( function() {
                return new CheckIn( {
                  venueId: seed.venue[ 1 ].id,
                  ribotId: seed.ribot[ 0 ].id,
                  checkedOutDate: moment().format()
                } ).save();
              } )
              .then( function() {
                // Set up scope for assertions
                this.expectedStatusCode = 201;

                // Make request
                helpers.request.bind( this )( {
                  method: this.method,
                  route: this.route,
                  headers: {
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveTwoCheckInsForUserInDatabase();

        } );

        describe( 'Handle previous check-in with different venue id', function() {

          before( function( done ) {
            // Set up db tables and seed
            helpers.db.setupForTests()
              .then( function() {
                return new CheckIn( {
                  venueId: seed.venue[ 0 ].id,
                  ribotId: seed.ribot[ 0 ].id
                } ).save();
              } )
              .then( function() {
                // Set up scope for assertions
                this.expectedStatusCode = 201;

                // Make request
                helpers.request.bind( this )( {
                  method: this.method,
                  route: this.route,
                  headers: {
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveTwoCheckInsForUserInDatabase();

        } );

        describe( 'Handle previous check-in with different venue id and checked-out date', function() {

          before( function( done ) {
            // Set up db tables and seed
            helpers.db.setupForTests()
              .then( function() {
                return new CheckIn( {
                  venueId: seed.venue[ 0 ].id,
                  ribotId: seed.ribot[ 0 ].id,
                  checkedOutDate: moment().format()
                } ).save();
              } )
              .then( function() {
                // Set up scope for assertions
                this.expectedStatusCode = 201;

                // Make request
                helpers.request.bind( this )( {
                  method: this.method,
                  route: this.route,
                  headers: {
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveTwoCheckInsForUserInDatabase();

        } );

        describe( 'Handle previous check-in with same venue id for a different user', function() {

          before( function( done ) {
            // Set up db tables and seed
            helpers.db.setupForTests()
              .then( function() {
                return new CheckIn( {
                  venueId: seed.venue[ 1 ].id,
                  ribotId: seed.ribot[ 1 ].id
                } ).save();
              } )
              .then( function() {
                // Set up scope for assertions
                this.expectedStatusCode = 201;

                // Make request
                helpers.request.bind( this )( {
                  method: this.method,
                  route: this.route,
                  headers: {
                    'Authorization': 'Bearer ' + helpers.signJwt( seed.access_token[ 0 ] )
                  }
                }, done );
              }.bind( this ) );
          } );

          shared.shouldRespondWithCorrectStatusCode();
          shared.shouldReturnValidResponseSchema();
          shared.shouldHaveSingleBeaconEncounter();
          shared.shouldHaveSingleCheckInForUserInDatabase();

        } );

      } );

    } );

  } );

} );
