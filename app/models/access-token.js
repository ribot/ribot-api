// External dependencies
var hat = require( 'hat' ),
    Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var db = require( '../../data' ),
    environment = require( '../lib/environment' ),
    utils = require( '../lib/utils' ),
    BaseModel = require( './base' );


/**
 * AccessToken model
 */
var AccessToken = BaseModel.extend( {

  tableName: 'access_token',

  hidden: _.union( BaseModel.prototype.hidden, [
    'id',
    'ribotId',
    'lastUsedDate',
    'token',
    '_sys'
  ] ),

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {

    accessToken: {
      get: function getAccessToken() {
        return this.get( 'token' );
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
  },

  setEvents: function setEvents() {

    BaseModel.prototype.setEvents.apply( this, arguments );

    this.on( 'creating', this.setPropertiesBeforeCreate );

  },

  onBeforeSave: function onBeforeSave( model, attributes, options ) {
    return BaseModel.prototype.onBeforeSave.apply( this, arguments )
      .bind( this )
      .then( function() {
        if ( model.get( 'token' ) ) {
          model.set( 'token', utils.encodeToken( model.get( 'token' ) ) );
        }
      } );
  },

  onSave: function onSave( model, response, options ) {
    return BaseModel.prototype.onSave.apply( this, arguments )
      .bind( this )
      .then( function() {
        if ( model.get( 'token' ) ) {
          model.set( 'token', utils.decodeToken( model.get( 'token' ) ) );
        }
      } );
  },

  setPropertiesBeforeCreate: function setPropertiesBeforeCreate( model, attributes, options ) {
    var date = new Date(),
        accessToken = hat();

    model.set( 'token', accessToken );
    model.set( 'lastUsedDate', date );

  }

} );

/**
 * Fetch access token and set last-used date
 */
AccessToken.fetchAndSetLastUsedDate = function updateLastUsedDate( query, options ) {
  query.token = utils.encodeToken( query.token );
  return AccessToken.where( query )
    .save( { last_used_date: new Date() }, { method: 'update', patch: true } )
    .then( function() {
      return AccessToken.find( query, options );
    } );
};


// Exports
module.exports = db.bookshelf.model( 'AccessToken', AccessToken );
