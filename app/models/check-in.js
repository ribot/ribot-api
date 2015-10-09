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
        return (this.get( 'checked_out_date' ) != null);
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
  }

} );


// Exports
module.exports = db.bookshelf.model( 'CheckIn', CheckIn );
