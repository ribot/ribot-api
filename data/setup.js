// External dependencies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( './index' ),
    schema = require( './schema' ),
    environment = require( '../app/lib/environment' ),
    logger = require( '../app/lib/logger' ),
    seed = require( './seed' );


var init = function() {

  var args = process.argv[ 2 ],
      shouldSeed = ( args && ( args === '--seed' || args === '-s' ) ),
      records = ( shouldSeed ) ? seed : null;

  db.dropTables( schema )
    .then( function() {
      return db.createTables( schema, records );
    } )
    .tap( function() {
      if ( shouldSeed ) {
        logger.info( 'Tables created and seeded' );
      } else {
        logger.info( 'Tables created' );
      }
    } )
    .catch( function( error ) {
      logger.error( error.stack );
    } )
    .finally( function() {
      process.exit( 0 );
    } );

};

init();
