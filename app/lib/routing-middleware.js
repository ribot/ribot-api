// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    passport = require( 'passport' );


// Dependencies
var logger = require( './logger' ),
    environment = require( './environment' ),
    ResponseError = require( './response-error' ),
    ValidationError = require( './validation-error' ),
    blueprintPromise = require( './blueprint' );


/**
 * Log incoming request to a route
 */
var logRequest = function logRequest ( request, response, next ) {

  logger.debug( 'Request: ' + request.method + ' ' + request.url );
  next();

};


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
 * Authorization check
 */
var isAuthorized = function isAuthorized( request, response, next ) {

  passport.authenticate( 'bearer', { session: false }, function ( error, user ) {
    var responseError;

    if ( user ) {

      request.user = user;
      next();

    } else {

      responseError = new ResponseError( 'unauthorized' );
      response.status( responseError.statusCode ).send( responseError );
      request.destroy();

    }

  } )( request, response, next );

};


/**
 * Request body schema validation
 */
var validateBody = function validateBody( request, response, next ) {

  blueprintPromise()
    .then( function ( blueprint ) {
      return new Promise( function( resolve, reject ) {
        var requestBody = request.body;

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


/**
 * Respond with a 404 ResponseError
 */
var routeNotFound = function routeNotFound( request, response, next ) {
  var responseError = new ResponseError( 'notFound' );

  response.status( responseError.statusCode ).send( responseError );

};


// Exports
module.exports = {
  logRequest: logRequest,
  removeTrailingSlash: removeTrailingSlash,
  isAuthorized: isAuthorized,
  validateBody: validateBody,
  routeNotFound: routeNotFound
};
