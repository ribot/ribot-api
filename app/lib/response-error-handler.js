// External dependencies
var Promise = require( 'bluebird' );


// Dependencies
var logger = require( './logger' ),
    ValidationError = require( './validation-error' ),
    ResponseError = require( './response-error' );

/**
 * Wraps promises so the errors are captured and an appropriate response is sent.
 */
var handleResponseError = function handleResponseError( response, promise ) {

  promise.catch( ValidationError, function( validationError ) {

    throw new ResponseError( 'invalidData', {
      errors: validationError.errors
    } );

  } )

  .catch( ResponseError, function ( responseError ) {

    response.status( responseError.statusCode );
    response.send( responseError );

  } )

  .catch( function ( error ) {
    var responseError = new ResponseError( 'unknown' );

    logger.error( error.stack );

    response.status( responseError.statusCode );
    response.send( responseError );

  } );

};


// Exports
module.exports = handleResponseError;
