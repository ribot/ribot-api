// External dependencies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' ),
    schema = require( '../schema' ),
    logger = require( '../../app/lib/logger' );


var init = function() {

  db.dropTables( schema.schema )
    .tap( function() {
      logger.info( 'Tables dropped' );
    } )
    .catch( function( error ) {
      logger.error( error.stack );
    } )
    .finally( function() {
      process.exit( 0 );
    } );

};

init();
