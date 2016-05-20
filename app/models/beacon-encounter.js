// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' );


/**
 * BeaconEncounter model
 */
var BeaconEncounter = BaseModel.extend( {

  tableName: 'beacon_encounter',

  hidden: _.union( BaseModel.prototype.hidden, [
    'beaconId',
    'checkInId'
  ] ),

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {

    encounterDate: function encounterDate() {
      var createdDate = this.get( 'createdDate' );

      if ( createdDate ) {
        return utils.formatDateTime( createdDate );
      } else {
        return null;
      }

    }

  } ),

  beacon: function beacon() {
    return this.belongsTo( 'Beacon' );
  },

  checkIn: function checkIn() {
    return this.belongsTo( 'CheckIn' );
  },

  validations: {
    id: {
      uuid: true
    },
    beaconId: {
      uuid: true
    },
    checkInId: {
      uuid: true
    }
  }

} );


// Exports
module.exports = db.bookshelf.model( 'BeaconEncounter', BeaconEncounter );
