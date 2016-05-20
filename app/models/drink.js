// External dependencies
var _ = require( 'lodash' ),
    moment = require( 'moment' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' ),
    ResponseError = require( '../lib/response-error' );


/**
 * Drink model
 */
var Drink = BaseModel.extend( {

  tableName: 'drink',

  hidden: _.union( BaseModel.prototype.hidden, [
    'ribotId',
    'ribot'
  ] ),

  ribot: function ribot() {
    return this.belongsTo( 'Ribot' );
  },

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {

    drinkDate: function drinkDate() {
      return utils.formatDateTime( this.get( 'createdDate' ) );
    }

  } ),

  validations: {
    id: {
      uuid: true
    },
    ribotId: {
      uuid: true
    }
  }

} );


/**
 * Find a drink by id
 */
Drink.findById = function findById( id, options ) {
  return new Drink( {
    id: id
  } )
    .fetch( options )
    .then( function( drink ) {

      if ( drink ) {
        return drink;
      } else {
        throw new ResponseError( 'notFound' );
      }

    } );
};


// Exports
module.exports = db.bookshelf.model( 'Drink', Drink );
