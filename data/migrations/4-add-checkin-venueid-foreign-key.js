// External ependancies
var Promise = require( 'bluebird' );

// Dependencies
var db = require( '../index' );

// Migrate function
var migrate = function migrate( trx ) {
  return trx.schema.table( 'check_in', function( table ) {
    table.uuid( 'venue_id' ).references( 'venue.id' );
  } );
};

// Exports
module.exports = migrate;
