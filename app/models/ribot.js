// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' );


// Dependencies
var db = require( '../../data' ),
    utils = require( '../lib/utils' ),
    ResponseError = require( '../lib/response-error' ),
    BaseModel = require( './base' );


/**
 * Ribot model
 */
var Ribot = BaseModel.extend( {

  tableName: 'ribot',

  hidden: _.union( BaseModel.prototype.hidden, [
    'firstName',
    'lastName',
    'providerCredentials',
    'accessTokens'
  ] ),

  defaults: {
    isAuthenticated: false
  },

  virtuals: _.extend( {}, BaseModel.prototype.virtuals, {

    name: {
      get: function getVirtualName() {
        return {
          first: this.get( 'firstName' ),
          last: this.get( 'lastName' )
        };
      },
      set: function setVirtualName( name ) {
        if ( _.isString( name.first ) ) {
          this.set( 'firstName', name.first );
        }
        if ( _.isString( name.last ) ) {
          this.set( 'lastName', name.last );
        }
      }
    }

  } ),

  // Relationships
  providerCredentials: function providerCredentials() {
    return this.hasMany( 'ProviderCredential' );
  },
  accessTokens: function accessTokens() {
    return this.hasMany( 'AccessToken' );
  },
  checkIns: function checkIns() {
    return this.hasMany( 'CheckIn' );
  },

  validations: {
    id: {
      uuid: true
    },
    firstName: {
      length: {
        minimum: 1,
        maximum: 35
      }
    },
    lastName: {
      length: {
        minimum: 1,
        maximum: 35
      }
    },
    email: {
      email: true
    },
    avatar: {
      url: true
    },
    dateOfBirth: {
      date: true
    },
    hexColor: {
      hexColor: true
    }
  },

  update: function personUpdate( attributes, options ) {

    // Remove isAuthenticated (read-only)
    if ( attributes.hasOwnProperty( 'isAuthenticated' ) ) {
      delete attributes.isAuthenticated;
    }

    // If person is authenticated
    if ( this.get( 'isAuthenticated' ) === true ) {

      // Cannot patch a resource if it doesn't belong to the user
      if ( this.get( 'id' ) !== options.actor.get( 'id' ) ) {
        throw new ResponseError( 'forbidden' );
      }

      // Cannot modify the email
      if ( attributes.hasOwnProperty( 'email' ) && this.get( 'email' ) !== attributes.email ) {
        throw new ResponseError( 'forbidden' );
      }

    }

    this.set( attributes );

    return this
      .save( null, {
        method: 'update',
        transacting: options.transacting
      } );
  },

  createOrUpdateProviderCredential: function createOrUpdateProviderCredential( query, attributes, options ) {
    return this.getProviderCredential( query, options )
      .then( function( providerCredential ) {
        if ( providerCredential ) {
          providerCredential.set( attributes );
          return providerCredential.save( null, { method: 'update', transacting: options.transacting } );
        } else {
          return this.related( 'providerCredentials' ).create( attributes, { transacting: options.transacting } );
        }
      }.bind( this ) );
  },

  getProviderCredential: function getProviderCredential( query, options ) {
    var providerCredential = this.related( 'providerCredentials' ).findWhere( query );

    if ( providerCredential ) {
      return Promise.resolve( providerCredential );
    } else {
      return this.related( 'providerCredentials' )
        .query( { where: query } )
        .fetch( options )
        .then( function( results ) {
          if ( results.length ) {
            return results.at( 0 );
          }
        } );
    }

  },

  createAccessToken: function createAccessToken( options ) {
    return this.related( 'accessTokens' ).fetch()
      .then( function( previousAccessTokens ) {
        return previousAccessTokens.invokeThen( 'destroy', { transacting: options.transacting } )
          .then( function() {
            return this.related( 'accessTokens' ).create( {}, { transacting: options.transacting } );
          }.bind( this ) );
      }.bind( this ) );
  },

  createCheckIn: function createCheckIn( attributes, options ) {
    return this.related( 'checkIns' ).create( attributes, options );
  }

} );


/**
 * Find a ribot by email
 */
Ribot.findByEmail = function findByEmail( email, options ) {

  if ( email ) {

    return new Ribot( {
      email: email
    } )
      .fetch( options )
      .then( function( ribot ) {

        if ( ribot ) {
          ribot.set( { isAuthenticated: true } );
          return ribot.save( null, {
            transacting: options.transacting
          } );
        } else {
          throw new ResponseError( 'noProfile' );
        }

      } );

  } else {
    throw new ResponseError( 'noProfile' );
  }

};


/**
 * Find a ribot by id
 */
Ribot.findById = function findById( id, options ) {

  if ( id ) {

    return new Ribot( {
      id: id
    } )
      .fetch( options )
      .then( function( ribot ) {

        if ( ribot ) {
          return ribot;
        } else {
          throw new ResponseError( 'notFound' );
        }

      } );

  } else {
    throw new ResponseError( 'notFound' );
  }

};


/**
 * Update ribot
 */
Ribot.update = function personUpdate( query, attributes, options ) {
  return new Promise( function( resolve, reject ) {
    if ( query.id == utils.formatId( options.actor.get( 'id' ) ) ) {
      return resolve( options.actor );
    } else {
      new Ribot( query ).fetch( {
        transacting: options.transacting
      } )
        .then( function( ribot ) {
          if ( !ribot ) {
            return reject( new ResponseError( 'notFound' ) );
          }
          return resolve( ribot );
        } )
        .catch( function( error ) {
          return reject( error );
        } )
    }
  } )
  .then( function( ribot ) {
    return ribot.update( attributes, options );
  } );
};


// Exports
module.exports = db.bookshelf.model( 'Ribot', Ribot );
