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
    db = require( '../../data' ),
    Beacon = require( '../models/beacon' );


/**
 * Initialise
 */
var init = function init() {

  router.get( '/beacons',
    middleware.isAuthorized,
    requestGetBeaconCollection );

  router.get( '/beacons/:beaconId',
    middleware.isAuthorized,
    requestGetBeacon );

  router.post( '/beacons/:beaconId/encounters',
    middleware.isAuthorized,
    middleware.requireScopes( 'user' ),
    requestPostBeaconEncounter );

};


/**
 * Returns a beacon payload from a given beacon model
 */
var createBeaconPayload = function createBeaconPayload( beacon ) {
  return beacon.toJSON();
};


/**
 * Returns a beacon encounter payload from a given beacon encounter model
 */
var createBeaconEncounterPayload = function createBeaconEncounterPayload( beaconEncounter ) {
  var beaconEncounterJson = beaconEncounter.toJSON();

  beaconEncounterJson.checkIn.ribot = {
    id: beaconEncounter.related( 'checkIn' ).get( 'ribotId' )
  };

  beaconEncounterJson.checkIn.venue = {
    id: beaconEncounter.related( 'checkIn' ).get( 'venueId' )
  };

  return beaconEncounterJson;
};


/**
 * Request GET /beacons
 * Respond with collection of all beacons
 */
var requestGetBeaconCollection = function requestGetBeaconCollection( request, response, next ) {
  var responseData = Beacon.collection().fetch( {
    withRelated: [ 'zone', 'zone.venue' ]
  } )
    .then( function( beacons ) {
      var payload = beacons.map( function( beacon ) {
        return createBeaconPayload( beacon );
      } );

      response.status( 200 ).send( payload );
    } );

  handleResponse( response, responseData );

};


/**
 * Request GET /beacons/:beaconId
 * Respond with single beacon
 */
var requestGetBeacon = function requestGetBeacon( request, response, next ) {

  var responseData = Beacon.findById( request.params.beaconId, {
    withRelated: [ 'zone', 'zone.venue' ]
  } )
    .then( function( beacon ) {
      response.status( 200 ).send( createBeaconPayload( beacon ) );
    } );

  handleResponse( response, responseData );

};


/**
 * Request POST /beacons/:beaconId/encounters
 * Respond with collection of all beacons
 */
var requestPostBeaconEncounter = function requestPostBeaconEncounter( request, response, next ) {
  var results = {},
      beaconId = request.params.beaconId,
      venueId,
      beaconFetchOptions = { withRelated: [ 'zone', 'zone.venue' ] };

  var responseData = db.bookshelf.transaction( function( transaction ) {
    return Beacon.findById( beaconId, beaconFetchOptions )
      .then( function( beacon ) {
        results.beacon = beacon;
        venueId = beacon.related( 'zone' ).related( 'venue' ).get( 'id' );
      } )
      .then( function( beacon ) {
        return request.user.ribot.fetchOrCreateCheckInWithVenueId( venueId, transaction );
      } )
      .then( function( checkIn ) {
        return checkIn.createBeaconEncounter( results.beacon, transaction );
      } );
  } )
    .then( function( beaconEncounter ) {
      return beaconEncounter.fetch( { withRelated: [ 'beacon', 'beacon.zone', 'beacon.zone.venue', 'checkIn' ] } );
    } )
    .then( function( beaconEncounter ) {
      response.status( 201 ).send( createBeaconEncounterPayload( beaconEncounter ) );
    } );

  handleResponse( response, responseData );

};


// Initialise
init();


// Exports
//
