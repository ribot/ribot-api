// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' ),
    ResponseError = require( '../lib/response-error' );


/**
 * Venue model
 */
var Venue = BaseModel.extend( {

  tableName: 'venue',

  hidden: _.union( BaseModel.prototype.hidden, [
    '_sys'
  ] ),

  checkIns: function checkIns() {
    return this.hasMany( 'CheckIn' );
  },

  zones: function zones() {
    return this.hasMany( 'Zone' );
  },

  validations: {
    id: {
      uuid: true
    }
  }

} );


/**
 * Find a venue by id
 */
Venue.findById = function findById( id, options ) {

  if ( id ) {

    return new Venue( {
      id: id
    } )
      .fetch( options )
      .then( function( venue ) {

        if ( venue ) {
          return venue;
        } else {
          throw new ResponseError( 'notFound' );
        }

      } );

  } else {
    throw new ResponseError( 'notFound' );
  }

};


// Exports
module.exports = db.bookshelf.model( 'Venue', Venue );
