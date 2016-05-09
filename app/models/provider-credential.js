// External dependencies
var _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    BaseModel = require( './base' );


/**
 * Provider-credential model
 */
var ProviderCredential = BaseModel.extend( {

  tableName: 'provider_credential',

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
  },

  update: function updateAccessToken( attributes, options ) {

    this.set( attributes );

    return this.save( null, _.extend( { method: 'update' }, options ) );
  }

} );


// Exports
module.exports = db.bookshelf.model( 'ProviderCredential', ProviderCredential );
