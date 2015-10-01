// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    ResponseError = require( '../lib/response-error' ),
    ValidationError = require( '../lib/validation-error' ),
    middleware = require( '../lib/routing-middleware' ),
    Venue = require( '../models/venue' );


/**
 * Initialise
 */
var init = function init() {

  router.get( '/venues',
    middleware.isAuthorized,
    requestGetVenuesCollection );

  router.get( '/venues/:venueId',
    middleware.isAuthorized,
    requestGetSingleVenue );

};


/**
 * Create the payload to send back given a single venue object
 */
var createVenuePayload = function createVenuePayload( venue ) {

  return venue.toJSON();

};

/**
 * Request GET /venues
 * Responds with a collection of venues
 */
var requestGetVenuesCollection = function requestGetVenuesCollection( request, response, next ) {

  return Venue.collection().fetch()

    .then( function( venues ) {
      var payload = venues.map( function( venue ) {
        return createVenuePayload( venue );
      } );

      response.status( 200 ).send( payload );
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
 * Request GET /venues/:venueId
 * Responds with a single venue
 */
var requestGetSingleVenue = function requestGetSingleVenue( request, response, next ) {

  return Venue.findById( request.params.venueId )

    .then( function( venue ) {
      response.status( 200 ).send( createVenuePayload( venue ) );
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


// Initialise
init();


// Exports
//
