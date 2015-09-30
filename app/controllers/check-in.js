// External dependencies
var _ = require( 'lodash' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    ResponseError = require( '../lib/response-error' ),
    ValidationError = require( '../lib/validation-error' ),
    middleware = require( '../lib/routing-middleware' );


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
  return payload;

};


/**
 * Request POST /check-in
 * Receive location to check-in to and responds with the new check-in object
 */
var requestPostCheckIn = function requestPostCheckIn( request, response, next ) {
  var results = {};

  request.user.ribot.createCheckIn( request.body )
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

    .catch( ValidationError, function( validationError ) {

      throw new ResponseError( 'invalidData', {
        errors: validationError.errors
      } );

    } )

    .catch( ResponseError, function ( responseError ) {

      response.status( responseError.statusCode );
      response.send( responseError );

      logger.error( responseError );

    } )

    .catch( function ( error ) {

      var responseError = new ResponseError( 'unknown' );

      response.status( responseError.statusCode );
      response.send( responseError );

      logger.error( error.stack );

    } );

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
