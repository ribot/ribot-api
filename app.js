// External dependencies
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    passport = require( 'passport' );


// Dependencies
var logger = require( './app/lib/logger' ),
    environment = require( './app/lib/environment' ),
    router = require( './app/lib/router' ),
    middleware = require( './app/lib/routing-middleware' );


// Local variables
var app = express();


/**
 * Initialise
 */
var init = function init() {

  // Setup middleware
  app.use( middleware.removeTrailingSlash );
  app.use( bodyParser.urlencoded( { extended: true } ) );
  app.use( bodyParser.json() );
  app.use( passport.initialize() );
  app.use( router );

  // Setup models
  require( './app/models' );

  // Setup controllers
  require( './app/controllers' );

  // Start the server
  var server = app.listen( environment.port, function () {
    logger.debug( 'ribot API listening at %s', environment.baseUrl );
  } );

  // Log the environment
  logger.info( environment );

};

// Get the party started
init();


// Exports
module.exports = app;
