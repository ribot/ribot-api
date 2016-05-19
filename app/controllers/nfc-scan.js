// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );


// Dependencies
var logger = require( '../lib/logger' ),
    router = require( '../lib/router' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    NfcTag = require( '../models/nfc-tag' );


/**
 * Initialise
 */
var init = function init() {

  router.post( '/nfc-scans',
    middleware.validateBody,
    requestPostNfcScan );

};


/**
 * Request POST /nfc-scans
 */
var requestPostNfcScan = function requestPostNfcScan( request, response ) {
  var responseData;

  responseData = new NfcTag( {
    uid: request.body.uid
  } )
    .fetch( { withRelated: [ 'ribot' ] } )
    .then( function( nfcTag ) {

      if ( nfcTag ) {
        return nfcTag;
      } else {
        throw new ResponseError( 'invalidData' );
      }

    } )
    .then( function( nfcTag ) {
      switch ( request.body.context ) {
        case 'drink':
          return nfcTag.related( 'ribot' ).createDrink( {
            type: 'water',
            volume: 125
          } );
      }
    } )
    .then( function() {
      return response.status( 201 ).send();
    } );

  handleResponse( response, responseData );

};


// Initialise
init();


// Exports
//
