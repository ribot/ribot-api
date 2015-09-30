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
    '_sys'
  ] ),

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {
    isCheckedOut: {
      get: function getIsCheckedOut() {
        return (this.get( 'checked_out_date' ) != null);
      }
    }
  } ),

  ribot: function ribot() {
    return this.belongsTo( 'Ribot' );
  },

  validations: {
    id: {
      uuid: true
    },
    ribotId: {
      uuid: true
    }
  }

} );


// Exports
module.exports = db.bookshelf.model( 'CheckIn', CheckIn );
