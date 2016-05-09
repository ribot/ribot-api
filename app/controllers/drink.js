// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    moment = require( 'moment' );

// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    Drink = require( '../models/drink' );


/**
 * Initialise
 */
var init = function init() {

  router.post( '/drinks',
    middleware.isAuthorized,
    middleware.validateBody,
    requestPostDrink );

  router.get( '/drinks/:id',
    requestGetDrink );

  router.get( '/drinks',
    requestGetDrinksCollection );

};


/**
 * Create drink payload
 */
var createDrinkPayload = function createDrinkPayload( drink ) {
  var drinkJson = drink.toJSON();

  drinkJson.ribot = {
    id: drink.get( 'ribotId' )
  };

  return drinkJson;
};


/**
 * Request: POST /drinks
 * Create a drink
 */
var requestPostDrink = function requestPostDrink( request, response ) {
  var responseData;

  responseData = request.user.ribot.createDrink( request.body )
    .then( function( drink ) {
      var payload = createDrinkPayload( drink );

      // TODO: emit socket event
      response.status( 201 ).send( payload );

    } );

  handleResponse( response, responseData );

};


/**
 * Request: GET /drink/:id
 * Retrieve drink
 */
var requestGetDrink = function requestGetDrink( request, response ) {
  var responseData;

  responseData = Drink.findById( request.params.id )
    .then( function( drink ) {
      var payload = createDrinkPayload( drink );

      response.status( 200 ).send( payload );

    } );

  handleResponse( response, responseData );

};


/**
 * Request: GET /drinks
 * Retrieve drinks collection
 */
var requestGetDrinksCollection = function requestGetDrinksCollection( request, response ) {
  var responseData;

  // TODO: ensure query data is valid, throw 400 if invalid

  responseData = Drink.collection().query( function( qb ) {
    if ( request.query.ribotId ) {
      qb.where( 'ribot_id', request.query.ribotId );
    }
    if ( request.query.dateFrom ) {
      qb.where( 'created_date', '>=', moment( request.query.dateFrom ).format() );
    }
    if ( request.query.dateTo ) {
      qb.where( 'created_date', '<', moment( request.query.dateTo ).format() );
    }
  } )
    .fetch()
    .then( function( drinks ) {
      var payload = drinks.map( function( drink ) {
        return createDrinkPayload( drink );
      } );

      response.status( 200 ).send( payload );

    } );

  handleResponse( response, responseData );

};


// Initialise
init();


// Exports
//
