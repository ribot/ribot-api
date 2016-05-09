// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' );


/**
 * Beacon model
 */
var Beacon = BaseModel.extend( {

  tableName: 'beacon',

  hidden: _.union( BaseModel.prototype.hidden, [
    'zoneId',
    '_sys'
  ] ),

  zone: function zone() {
    return this.belongsTo( 'Zone' );
  },

  encounters: function encounters() {
    return this.hasMany( 'BeaconEncounter' );
  },

  validations: {
    id: {
      uuid: true
    },
    zoneId: {
      uuid: true
    },
    uuid: {
      uuid: true
    }
  }

} );


/**
 * Find a beacon by id
 */
Beacon.findById = function findById( id, options ) {
  return new Beacon( {
    id: id
  } )
    .fetch( options )
    .then( function( beacon ) {

      if ( beacon ) {
        return beacon;
      } else {
        throw new ResponseError( 'notFound' );
      }

    } );
};


// Exports
module.exports = db.bookshelf.model( 'Beacon', Beacon );
