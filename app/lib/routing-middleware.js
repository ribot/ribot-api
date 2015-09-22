// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );


// Dependencies
var logger = require( './logger' ),
    environment = require( './environment' ),
    ResponseError = require( './response-error' ),
    ValidationError = require( './validation-error' ),
    blueprintPromise = require( './blueprint' );


/**
 * Redirect URLs with trailing slash
 * eg. /me/ to /me
 */
var removeTrailingSlash = function removeTrailingSlash ( request, response, next ) {

  if ( request.url.substr( -1 ) == '/' && request.url.length > 1 ) {
    response.redirect( 301, request.url.slice( 0, -1 ) );
  } else {
    next();
  }

};


/**
 * Request body schema validation
 */
var validateBody = function validateBody( request, response, next ) {

  blueprintPromise()
  .then( function ( blueprint ) {
    return new Promise( function( resolve, reject ) {
      var requestBody = request.body;

      if ( _.isEmpty( requestBody ) ) {
        return reject( new ResponseError( 'invalidData' ) );
      }

      blueprint.validate( requestBody, {
        type: 'request',
        route: request.route.path,
        method: request.method
      }, function( error, result ) {
        var validationErrors = {};

        if ( error ) {
          return reject( new Error( error ) );
        }

        if ( result.errors.length ) {

          _.each( result.errors, function( propertyError ) {
            validationErrors[ propertyError.property.replace( /instance\./, '' ) ] = [ propertyError.message ];
          } );

          return reject( new ValidationError( validationErrors ) );

        } else {

          return resolve();

        }

      } );
    } );
  } )

  .then( function () {
    next();
  } )

  .catch( ValidationError, function( validationError ) {

    throw new ResponseError( 'invalidData', {
      errors: validationError.errors
    } );

  } )

  .catch( ResponseError, function( responseError ) {
    response.status( responseError.statusCode ).send( responseError );
  } )

  .catch( function( error ) {
    var responseError = new ResponseError();

    response.status( responseError.statusCode ).send( responseError );

    logger.error( error.stack );

  } );

};


// Exports
module.exports = {
  removeTrailingSlash: removeTrailingSlash,
  validateBody: validateBody
};
