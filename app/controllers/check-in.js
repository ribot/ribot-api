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
    CheckIn = require( '../models/check-in' ),
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

  router.put( '/check-ins/:checkInId',
    middleware.isAuthorized,
    middleware.validateBody,
    requestPutCheckIn );

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
              return resolve();

            } else {

              return reject( new ResponseError( 'invalidData', {
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

  response.status( responseError.statusCode ).send( responseError );

};


/**
 * Request PUT /check-in/:checkInId
 * Responds with the given check-in object that has been modified with the given parameters
 */
var requestPutCheckIn = function requestPutCheckIn( request, response, next ) {
  var results = {
    ribot: request.user.ribot
  };

  var responseData = CheckIn.findById( request.params.checkInId, { withRelated: [ 'ribot' ] } )
    .then( function( checkIn ) {

      // If the checkin requested does not match the user that the access token belongs to deny access with a 404 error
      if ( checkIn.related( 'ribot' ).id !== request.user.ribot.id ) {
        throw new ResponseError( 'notFound' );
      }

      // Ensure that the data the caller is trying to change is only attempting to mark the check-in as checked out. Everything else is unsupported
      if ( request.body.isCheckedOut !== true ) {
        throw new ResponseError( 'invalidData' );
      }

      return checkIn.checkOut();
    } )
    .then( function( checkIn ) {
      results.checkIn = checkIn;
    } )
    .then( function() {
      response.status( 200 ).send( createCheckInResponsePayload( results ) );
    } );

  handleResponse( response, responseData);

};


/**
 * Request GET /check-in
 * Receive search parameters and responds with the check-in objects that match
 */
var requestGetCheckInCollection = function requestGetCheckInCollection( request, response, next ) {
  var responseError = new ResponseError( 'notImplemented' );

  response.status( responseError.statusCode ).send( responseError );

};


// Initialise
init();


// Exports
//
