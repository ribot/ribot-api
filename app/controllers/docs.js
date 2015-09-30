// External dependencies
var fs = require( 'fs' ),
    aglio = require( 'aglio' );


// Dependencies
var logger = require( '../lib/logger' ),
    environment = require( '../lib/environment' ),
    router = require( '../lib/router' ),
    ResponseError = require( '../lib/response-error' ),
    utils = require( '../lib/utils' );


var specHtml;


/**
 * Initialise controller
 */
var init = function init () {

  router.get( '/', requestGetIndex );
  router.get( '/spec', requestGetSpec );

};


/**
 * Get spec file data
 */
var getSpec = function getSpec ( done ) {
  var specFilePath = __dirname + '/../../spec/blueprint.md';

  fs.stat( specFilePath, function ( error, stats ) {

    if ( error ) {
      return done( error );
    }

    fs.readFile( specFilePath, function ( error, data ) {

      if ( error ) {
        return done( error );
      }

      done( null, {
        data: data,
        stats: stats
      } );

    } );

  } );

};


/**
 * Get spec HTML
 */
var getSpecHtml = function getSpecHtml ( done ) {

  // Return cached HTML, if available
  if ( specHtml ) {
    return done( null, specHtml );
  }

  getSpec( function ( error, spec ) {
    var blueprint,
        options;

    if ( error ) {
      return done( error );
    }

    blueprint = spec.data.toString();
    blueprint = blueprint.replace( '{{lastModifiedDate}}', utils.formatDateTime( spec.stats.mtime ) );

    options = {
      theme: 'flatly',
      themeFullWidth: true
    };

    aglio.render( blueprint, options, function ( error, html, warnings ) {

      if ( error ) {
        return done( error );
      }

      if ( warnings && warnings.length ) {
        logger.warn( 'Blueprint parse warnings', warnings );
      }

      specHtml = html;

      done( error, specHtml );

    } );

  } );

};


/**
 * Request: Get Index
 */
var requestGetIndex = function requestGetIndex ( request, response, next ) {
  var responseError;

  getSpecHtml( function ( error, html ) {

    if ( error ) {
      logger.error( error );
      logger.error( error.stack );
      responseError = new ResponseError();
      response.status( responseError.statusCode );
      return response.send( responseError );
    }

    response.set( 'Content-Type', 'text/html' );
    response.send( html );

  } );

};


/**
 * Request: Get Spec
 */
var requestGetSpec = function requestGetSpec ( request, response, next ) {

  getSpec( function ( error, spec ) {

    if ( error ) {
      logger.error( error.stack );
      responseError = new ResponseError();
      response.status( responseError.statusCode );
      return response.send( responseError );
    }

    response.set( 'Content-Disposition', 'attachment; filename="ribot-api-spec.markdown"' );
    response.set( 'Content-Type', 'text/markdown' );
    response.send( spec.data );

  } );

};


// Initialise
init();
