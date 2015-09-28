// External ependancies
var Promise = require( 'bluebird' );

// Dependencies


// Migrate function
var migrate = function migrate( trx ) {
  return trx.schema.table( 'ribot', function ( table ) {
    table.string( 'hex_color' );
  } );
};

// Exports
module.exports = migrate;
