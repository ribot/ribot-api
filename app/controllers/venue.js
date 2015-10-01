// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponseError = require( '../lib/response-error-handler' ),
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

  handleResponseError( response,

    Venue.collection().fetch()

    .then( function( venues ) {
      var payload = venues.map( function( venue ) {
        return createVenuePayload( venue );
      } );

      response.status( 200 ).send( payload );
    } )

  );

};


/**
 * Request GET /venues/:venueId
 * Responds with a single venue
 */
var requestGetSingleVenue = function requestGetSingleVenue( request, response, next ) {

  handleResponseError( response,

    Venue.findById( request.params.venueId )

    .then( function( venue ) {
      response.status( 200 ).send( createVenuePayload( venue ) );
    } )

  );

};


// Initialise
init();


// Exports
//
