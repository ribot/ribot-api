// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    Ribot = require( '../models/ribot' );


/**
 * The relations needed when getting related check-ins
 */
var checkInRelations = [
  'checkIns',
  'checkIns.venue',
  'checkIns.beaconEncounters',
  'checkIns.beaconEncounters.beacon',
  'checkIns.beaconEncounters.beacon.zone',
  'checkIns.beaconEncounters.beacon.zone.venue'
];


/**
 * Initialise
 */
var init = function init() {

  router.get( '/ribots',
    requestGetRibotCollection );

  router.get( '/ribots/me',
    middleware.isAuthorized,
    middleware.requireScopes( 'user' ),
    requestGetAuthenticatedRibot );

  router.get( '/ribots/:ribotId',
    requestGetSingleRibot );

};

/**
 * Returns a promise that checks if the call is authenticated if the it is asking for sensitive data.
 * If it is not asking for sensitive information, it resolves as no authentication is needed.
 */
var checkAuthenticatedIfRequired = function checkAuthenticatedIfRequired( request, response ) {

  return new Promise( function( resolve, reject ) {

    if ( !requestingSensitiveData( request ) ) {
      resolve();
    } else {
      middleware.isAuthorized( request, response, function() {
        resolve();
      } );
    }

  } );

};


/**
 * Returns true if the request asks for sensitive information.
 */
var requestingSensitiveData = function requestingSensitiveData( request ) {
  return request.query.embed == 'checkins';
};



/**
 * Create ribot payload from ribot
 */
var createRibotPayload = function createRibotPayload( ribot ) {

  var payload = {},
      ribotProfileJson = _.omit( ribot.toJSON(), 'checkIns' ),
      checkInsJson = ribot.related( 'checkIns' ).toJSON();

  payload.profile = ribotProfileJson;

  if ( checkInsJson.length > 0 ) {
    // Sort by the check in date, reverse it so it's in descending order, then take only the latest
    // 5 checkins, then remove the venue property if no venue relation existed. We then check if there
    // are an beacon encounter, remove the property if not or sort the array if so
    checkInsJson = _.chain( checkInsJson )
      .sortBy( function( checkInJson ) {
        return new Date( checkInJson.checkedInDate ).getTime();
      } )
      .reverse()
      .take( 5 )
      .map( function( checkInJson ) {
        return _.omit( checkInJson, function( value, key ) {
          return ( key == 'venue' && !value.id );
        } );
      } )
      .map( function( checkInJson ) {
        return _.omit( checkInJson, function( value, key ) {
          return ( key == 'beaconEncounters' && value.length == 0 );
        } );
      } )
      .map( function( checkInJson ) {
        if ( checkInJson.beaconEncounters ) {
          checkInJson.beaconEncounters = _.chain( checkInJson.beaconEncounters )
            .sortBy( function( beaconEncounterJson ) {
              return new Date( beaconEncounterJson.encounterDate ).getTime();
            } )
            .reverse();
        }

        return checkInJson;
      } );

    payload.checkIns = checkInsJson;
  }

  return payload;

};


/**
 * Request GET /ribots
 * Responds with a collection of all ribots
 */
var requestGetRibotCollection = function requestGetRibotCollection( request, response, next ) {

  handleResponse( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {

      var options = {};

      if ( requestingSensitiveData( request ) ) {
        options.withRelated = checkInRelations;
      }

      return Ribot.collection().fetch( options )
        .then( function( ribots ) {
          var payload = ribots.map( function( ribot ) {
            return createRibotPayload( ribot );
          } );
          response.status( 200 ).send( payload );
        } );

    } )

  );

};


/**
 * Request GET /ribots/me
 * Responds with the current authenticated ribot
 */
var requestGetAuthenticatedRibot = function requestGetAuthenticatedRibot( request, response, next ) {

  handleResponse( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {
      if ( requestingSensitiveData( request ) ) {
        return request.user.ribot.fetch( {
          withRelated: checkInRelations
        } );
      } else {
        return Promise.resolve();
      }
    })

    .then( function() {
      response.status( 200 ).send( createRibotPayload( request.user.ribot ) );
    } )

  );

};


/**
 * Request GET /ribots/:id
 * Responds with the the ribot asked for
 */
var requestGetSingleRibot = function requestGetSingleRibot( request, response, next ) {

  handleResponse( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {

      var options = {};

      if ( requestingSensitiveData( request ) ) {
        options.withRelated = checkInRelations;
      }

      return Ribot.findById( request.params.ribotId, options )
        .then( function( ribot ) {
          response.status( 200 ).send( createRibotPayload( ribot ) );
        } );

    } )

  );

};


// Initialise
init();


// Exports
//
