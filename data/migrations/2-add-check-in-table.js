// External ependancies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' );


// Local variables
var checkInSchema = {
  primary: 'id',
  columns: {
    id:                 { type: 'uuid' },
    ribot_id:           { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
    label:              { type: 'text' },
    latitude:           { type: 'float' },
    longitude:          { type: 'float' },
    checkedOutDateTime: { type: 'dateTime' },
    created_date:       { type: 'dateTime', nullable: false },
    updated_date:       { type: 'dateTime', nullable: false }
  }
};


// Migrate function
var migrate = function migrate( trx ) {
  return db.createTable( 'check_in', checkInSchema, null, trx );
};

// Exports
module.exports = migrate;
