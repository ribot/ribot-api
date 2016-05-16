// External ependancies
var Promise = require( 'bluebird' );


// Dependencies
var db = require( '../index' );


// Local variables
var nfcTagSchema = {
  primary: 'id',
  columns: {
    id:                      { type: 'uuid', nullable: false },
    ribot_id:                { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
    uid:                     { type: 'text', nullable: false, unique: true },
    created_date:            { type: 'dateTime', nullable: false },
    updated_date:            { type: 'dateTime', nullable: false }
  }
};


// Migrate function
var migrate = function migrate( trx ) {
  return db.createTable( 'nfc_tag', nfcTagSchema, null, trx );
};


// Exports
module.exports = migrate;
