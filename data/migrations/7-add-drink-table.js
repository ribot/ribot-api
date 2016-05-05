// External ependancies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' ),
    schema = require( '../schema' );


// Migrate function
var migrate = function migrate( trx ) {
  return db.createTable( 'drink', schema.schema.drink, null, trx );
};

// Exports
module.exports = migrate;
