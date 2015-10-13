// External ependancies
var Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var db = require( '../index' );


// Local variables
var tablesSchemas = {
  zone: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      label:                   { type: 'text', nullable: false },
      venue_id:                { type: 'uuid', nullable: false, references: { table: 'venue', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  beacon: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      zone_id:                 { type: 'uuid', nullable: false, references: { table: 'zone', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  beacon_encounter: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      beacon_id:               { type: 'uuid', nullable: false, references: { table: 'beacon', column: 'id' } },
      check_in_id:             { type: 'uuid', nullable: false, references: { table: 'check_in', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  }
};


// Migrate function
var migrate = function migrate( trx ) {
  return Promise.all( _.map( tablesSchemas, function( tableSchema, tableName ) {
    return db.createTable( tableName, tableSchema, null, trx );
  } ) );
};

// Exports
module.exports = migrate;
