// External ependancies
var Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var db = require( '../index' ),
    Beacon = require( '../../app/models/beacon' );


/**
 * Alters the table by adding the required columns
 */
var alterTable = function alterTable( trx ) {
  return trx.schema.table( 'beacon', function( table ) {
    table.uuid( 'uuid' );
    table.text( 'major' );
    table.text( 'minor' );
  } );
};


/**
 * Adds new default values to all the beacon entires in the database
 */
var alterData = function alterData( trx ) {
  return Beacon.fetchAll( { transacting: trx } )
    .then( function( beacons ) {
      beacons.each( function( beacon ) {
        return beacon.save( { uuid: beacon.id, major: '1000', minor: '1000' }, { patch: true, transacting: trx } );
      } );
    } );
};


// Migrate function
var migrate = function migrate( trx ) {
  return Promise.all( [ alterTable( trx ), alterData( trx ) ] );
};


// Exports
module.exports = migrate;
