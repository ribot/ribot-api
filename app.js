// External dependencies
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    passport = require( 'passport' );


// Dependencies
var logger = require( './app/lib/logger' ),
    environment = require( './app/lib/environment' ),
    router = require( './app/lib/router' ),
    middleware = require( './app/lib/routing-middleware' ),
    db = require( './data' ),
    schema = require( './data/schema' ),
    migrations = require( './data/migrations' );


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

  // Log the environment
  logger.info( environment );

  // Ensure the database is set up correctly and then start the server
  return db.setupDatabase( schema, migrations ).then( function() {
    var server = app.listen( environment.port, function () {
      logger.debug( 'ribot API listening at %s', environment.baseUrl );
    } );
  } )
    .catch( function( error ) {
      logger.error( 'Cannot start server due to error', error.stack || error );
      process.exit( 1 );
    } );

};

// Get the party started, unless we're running tests
if ( environment.name != 'test' ) {
  init();
}


// Exports
module.exports = {
  init: init,
  app: app
};
