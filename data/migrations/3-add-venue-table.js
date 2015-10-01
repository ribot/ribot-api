// External ependancies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' );


// Local variables
var venueSchema = {
  primary: 'id',
  columns: {
    id:                      { type: 'uuid' },
    label:                   { type: 'text', nullable: false },
    latitude:                { type: 'float' },
    longitude:               { type: 'float' },
    created_date:            { type: 'dateTime', nullable: false },
    updated_date:            { type: 'dateTime', nullable: false }
  }
};


// Migrate function
var migrate = function migrate( trx ) {
  return db.createTable( 'venue', venueSchema, null, trx );
};

// Exports
module.exports = migrate;
