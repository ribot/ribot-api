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
 * NFC Tag model
 */
var NfcTag = BaseModel.extend( {

  tableName: 'nfc_tag',

  hidden: _.union( BaseModel.prototype.hidden, [
    'ribotId',
    'ribot'
  ] ),

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
module.exports = db.bookshelf.model( 'NfcTag', NfcTag );
