// External ependancies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' );


// Local variables
var consumerSchema = {
  primary: 'id',
  columns: {
    id:                      { type: 'uuid' },
    name:                    { type: 'text', nullable: false, unique: true },
    scope_list:              { type: 'text', nullable: false },
    secret:                  { type: 'text', nullable: false },
    created_date:            { type: 'dateTime', nullable: false },
    updated_date:            { type: 'dateTime', nullable: false }
  }
};


// Migrate function
var migrate = function migrate( trx ) {
  return db.createTable( 'consumer', consumerSchema, null, trx );
};


// Exports
module.exports = migrate;
