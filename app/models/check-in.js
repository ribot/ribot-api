// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' );


/**
 * CheckIn model
 */
var CheckIn = BaseModel.extend( {

  tableName: 'check_in',

  hidden: _.union( BaseModel.prototype.hidden, [
    'ribotId',
    'venueId',
    '_sys'
  ] ),

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {
    isCheckedOut: function getIsCheckedOut() {
        return (this.get( 'checkedOutDate' ) != null);
    },
    checkedInDate: function getCheckedInDate() {
        return utils.formatDateTime( this.get( 'createdDate' ) );
    }
  } ),

  ribot: function ribot() {
    return this.belongsTo( 'Ribot' );
  },

  venue: function venue() {
    return this.belongsTo( 'Venue' );
  },

  beaconEncounters: function beaconEncounters() {
    return this.hasMany( 'BeaconEncounter' );
  },

  validations: {
    id: {
      uuid: true
    },
    ribotId: {
      uuid: true
    },
    venueId: {
      uuid: true
    }
  },

  createBeaconEncounter: function createBeaconEncounter( beacon, transaction ) {
    return this.related( 'beaconEncounters' ).create( {
      beaconId: beacon.get( 'id' )
    }, {
      transacting: transaction
    } );
  }

} );


/**
 * Find a check in by id
 */
CheckIn.findById = function findById( id, options ) {

  if ( id ) {

    return new CheckIn( {
      id: id
    } )
      .fetch( options )
      .then( function( checkIn ) {

        if ( checkIn ) {
          return checkIn;
        } else {
          throw new ResponseError( 'notFound' );
        }

      } );

  } else {
    throw new ResponseError( 'notFound' );
  }

};


// Exports
module.exports = db.bookshelf.model( 'CheckIn', CheckIn );
