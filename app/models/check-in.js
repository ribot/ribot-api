// External dependencies
var _ = require( 'lodash' ),
    moment = require( 'moment' );


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
      var checkedOutDate = this.get( 'checkedOutDate' );

      if ( this.has( 'id' ) ) {
        return checkedOutDate ? true : false;
      } else {
        return null;
      }
    },

    checkedInDate: function getCheckedInDate() {
      var createdDate = this.get( 'createdDate' );

      if ( createdDate ) {
        return utils.formatDateTime( createdDate );
      } else {
        return null;
      }

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

  latestBeaconEncounter: function latestBeaconEncounter() {
    return this.hasOne( 'BeaconEncounter' ).query( function( qb ) {
      qb.orderBy( 'created_date', 'desc' );
      qb.limit( 1 );
    } );
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
  },

  checkOut: function checkOut( transaction ) {
    return this.save( {
      checkedOutDate: moment()
    }, {
      patch: true,
      transacting: transaction
    } );
  }

} );


/**
 * Find a check in by id
 */
CheckIn.findById = function findById( id, options ) {
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
};


// Exports
module.exports = db.bookshelf.model( 'CheckIn', CheckIn );
