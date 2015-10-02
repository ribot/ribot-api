// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' );
    ResponseError = require( '../lib/response-error' ),
    middleware = require( '../lib/routing-middleware' ),
    Venue = require( '../models/venue' );


/**
 * Initialise
 */
var init = function init() {

  router.post( '/check-ins',
    middleware.isAuthorized,
    middleware.validateBody,
    requestPostCheckIn );

  router.get( '/check-ins/:id',
    middleware.isAuthorized,
    requestGetCheckIn );

  router.get( '/check-ins',
    middleware.isAuthorized,
    requestGetCheckInCollection );

};

/**
 * Create check-in response payload
 */
var createCheckInResponsePayload = function createCheckInResponsePayload( results ) {

  var payload = results.checkIn.toJSON();
  payload.ribot = _.pick( results.ribot.toJSON(), 'id' );

  if ( results.venue ) {
    payload.venue = results.venue.toJSON();
  }

  return payload;

};


/**
 * Request POST /check-in
 * Receive location to check-in to and responds with the new check-in object
 */
var requestPostCheckIn = function requestPostCheckIn( request, response, next ) {
  var results = {};

  handleResponse( response,

    new Promise( function( resolve, reject ) {

      // If the request wants to check-in with a venue ID, check that venue exists first
      // Store it if it does, reject if not
      if ( request.body.venueId ) {

        return new Venue( { id: request.body.venueId } ).fetch()

        .then( function( venue ) {

          if (venue ) {
            results.venue = venue;
            resolve();
          } else {
            reject( new ResponseError( 'invalidData', {
              errors: [
                {
                  property: 'venueId',
                  messages: [ 'Venue does not exist with that venue id' ]
                }
              ]
            } ) );
          }

        } );

      } else {
        resolve();
      }

    } )

    .then( function() {
      return request.user.ribot.createCheckIn( request.body )
    } )

    .tap( function( checkIn ) {
      results.checkIn = checkIn;
    } )

    .then( function( checkIn ) {
      return checkIn.related( 'ribot' ).fetch()
        .tap( function( ribot ) {
          results.ribot = ribot;
        } );
    } )

    .then( function() {
      response.status( 201 ).send( createCheckInResponsePayload( results ) );
    } )

  );

};


/**
 * Request GET /check-in/:id
 * Responds with the given check-in object
 */
var requestGetCheckIn = function requestGetCheckIn( request, response, next ) {

  var responseError = new ResponseError( 'notImplemented' );

  response.status( responseError.statusCode );
  response.send( responseError );

};


/**
 * Request GET /check-in
 * Receive search parameters and responds with the check-in objects that match
 */
var requestGetCheckInCollection = function requestGetCheckInCollection( request, response, next ) {

  var responseError = new ResponseError( 'notImplemented' );

  response.status( responseError.statusCode );
  response.send( responseError );

};


// Initialise
init();


// Exports
//
