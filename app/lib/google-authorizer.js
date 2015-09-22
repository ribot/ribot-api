// External dependencies
var google = require( 'googleapis' ),
    Promise = require( 'bluebird' ),
    moment = require( 'moment' );


// Dependencies
var environment = require( './environment' ),
    utils = require( './utils' ),
    logger = require( './logger' );


var googleClientId = environment.google.clientId,
    googleClientSecret = environment.google.clientSecret,
    googleRedirectUri = 'urn:ietf:wg:oauth:2.0:oob';


utils.promisify( google.auth.OAuth2.prototype );


/**
 * Google Authorizer constructor
 * Wraps the Google OAuth2 class with extra helpers
 */
var GoogleAuthorizer = function GoogleAuthorizer( options ) {

  this.client = new google.auth.OAuth2( googleClientId, googleClientSecret, options.googleRedirectUri || googleRedirectUri );
  this.providerCredential = options.providerCredential;

  if ( this.providerCredential ) {
    this.client.setCredentials( {
      access_token: this.providerCredential.get( 'accessToken' ),
      refresh_token: this.providerCredential.get( 'refreshToken' )
    } );
  }

  return this;
};

GoogleAuthorizer.prototype = {

  verify: function verify( options ) {
    var now = moment(),
        expiryDate = moment( this.providerCredential.get( 'expiryDate' ) );

    if ( expiryDate.isBefore( now ) ) {
      return this.refreshAccessToken()
        .bind( this )
        .then( function( tokens ) {
          return this.providerCredential.update( {
            accessToken: tokens.access_token,
            expiryDate: moment( parseInt( tokens.expiry_date, 10 ) )
          }, options )
        } )
        .then( function() {
          return this;
        } );
    } else {
      return Promise.resolve( this );
    }

  },

  getTokens: function getTokens( authorizationCode ) {

    this.client.generateAuthUrl( {
      access_type: 'offline',
      scope: [
        environment.google.baseUrl + '/auth/userinfo.email',
        environment.google.baseUrl + '/auth/userinfo.profile',
      ]
    } );

    return this.client.getTokenPromise( authorizationCode )
      .bind( this )
      .tap( function( tokens ) {
        this.client.setCredentials( tokens );
      } );
  },

  refreshAccessToken: function refreshAccessToken() {
    return this.client.refreshAccessTokenPromise();
  }

};


// Exports
module.exports = GoogleAuthorizer;
