// External ependancies
var Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var db = require( '../index' ),
    Ribot = require( '../../app/models/ribot' );


/**
 * Alters the table by adding the required column
 */
var createColumn = function createColumn( trx ) {
  return trx.schema.table( 'ribot', function( table ) {
    table.boolean( 'is_active' );
  } );
};


/**
 * Adds new default values to all the ribot entities in the database
 */
var alterData = function alterData( trx ) {
  return Ribot.fetchAll( { transacting: trx } )
    .then( function( ribots ) {
      return ribots.map( function( ribot ) {
        return ribot.save( { isActive: true }, { patch: true, transacting: trx } );
      } );
    } );
};


/**
 * Alters the table by adding the required column
 */
var alterColumn = function alterColumn( trx ) {
  return trx.schema.raw( "ALTER TABLE ribot ALTER COLUMN is_active SET NOT NULL" );
};


// Migrate function
var migrate = function migrate( trx ) {
  return Promise.all( [ createColumn( trx ), alterData( trx ), alterColumn( trx ) ] );
};


// Exports
module.exports = migrate;
