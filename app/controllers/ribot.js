// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponseError = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    Ribot = require( '../models/ribot' );


/**
 * Initialise
 */
var init = function init() {

  router.get( '/ribots',
    requestGetRibotCollection );

  router.get( '/ribots/me',
    middleware.isAuthorized,
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
    payload.checkIns = checkInsJson;
  }

  return payload;

};


/**
 * Request GET /ribots
 * Responds with a collection of all ribots
 */
var requestGetRibotCollection = function requestGetRibotCollection( request, response, next ) {

  handleResponseError( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {

      var options = {};

      if ( requestingSensitiveData( request ) ) {
        options.withRelated = [ 'checkIns' ];
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

  handleResponseError( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {
      if ( requestingSensitiveData( request ) ) {
        return request.user.ribot.related( 'checkIns' ).fetch();
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

  handleResponseError( response,

    checkAuthenticatedIfRequired( request, response )

    .then( function() {

      var options = {};

      if ( requestingSensitiveData( request ) ) {
        options.withRelated = [ 'checkIns' ];
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
