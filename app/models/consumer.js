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
var Consumer = BaseModel.extend( {

  tableName: 'consumer',

  hidden: _.union( BaseModel.prototype.hidden, [
    'secret'
  ] ),

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {
    scopes: {
      get: function getScopes() {
        return this.get( 'scopeList' ).split( ' ' );
      },
      set: function setScopes( scopes ) {
        return this.set( 'scopeList', scopes.join( ' ' ) );
      }
    }
  } ),

  validations: {
    id: {
      uuid: true
    }
  },

  setEvents: function setEvents() {
    BaseModel.prototype.setEvents.apply( this, arguments );
    this.on( 'creating', this.setPropertiesBeforeCreate );
  },

  onBeforeSave: function onBeforeSave( model, attributes, options ) {
    return BaseModel.prototype.onBeforeSave.apply( this, arguments )
      .bind( this )
      .then( function() {
        var secret = model.get( 'secret' );
        if ( secret ) {
          model.set( 'secret', utils.encodeToken( secret ) );
        }
      } );
  },

  onSave: function onSave( model, response, options ) {
    return BaseModel.prototype.onSave.apply( this, arguments )
      .bind( this )
      .then( function() {
        var secret = model.get( 'secret' );
        if ( secret ) {
          model.set( 'secret', utils.decodeToken( secret ) );
        }
      } );
  },

  setPropertiesBeforeCreate: function setPropertiesBeforeCreate( model, attributes, options ) {
    model.set( 'secret', utils.createUuid() );
  },

  /**
   * Checks if the consumer has access to the given scopes
   */
  hasScopes: function hasScopes( requiredScopes ) {
    var scopes = this.get( 'scopes' );

    if ( !_.isString( requiredScopes ) ) {
      requiredScopes = [ requiredScopes ];
    }

    return _.every( requiredScopes, function( requiredScope ) {
      return _.contains( scopes, requiredScope );
    } );
  }

} );


// Exports
module.exports = db.bookshelf.model( 'Consumer', Consumer );
