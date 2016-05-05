// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    Venue = require( '../models/venue' );


/**
 * Initialise
 */
var init = function init() {

  router.get( '/drinks',
    requestGetDrinksCollection );

  router.post( '/drinks',
    middleware.isAuthorized,
    middleware.validateBody,
    requestPostDrink );

};


/**
 * Request: GET /drinks
 * Retrieve drinks collection
 */
var requestGetDrinksCollection = function requestGetDrinksCollection( request, response  ) {
  return [];
};


/**
 * Request: POST /drinks
 * Create a drink
 */
var requestPostDrink = function requestPostDrink( request, response ) {
  return {};
};


// Initialise
init();


// Exports
//
