// External ependancies
var Promise = require( 'bluebird' );

// Dependencies


// Migrate function
var migrate = function migrate( trx ) {
  return trx.schema.table( 'ribot', function ( table ) {
    table.string( 'email' );
  } );
};

// Exports
module.exports = migrate;
