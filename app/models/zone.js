// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' );


/**
 * Zone model
 */
var Zone = BaseModel.extend( {

  tableName: 'zone',

  hidden: _.union( BaseModel.prototype.hidden, [
    'venueId',
    '_sys'
  ] ),

  beacons: function beacons() {
    return this.hasMany( 'Beacon' );
  },

  venue: function venue() {
    return this.belongsTo( 'Venue' );
  },

  validations: {
    id: {
      uuid: true
    },
    venueId: {
      uuid: true
    }
  }

} );


// Exports
module.exports = db.bookshelf.model( 'Zone', Zone );
