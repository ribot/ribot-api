// External dependencies
var url = require( 'url' ),
    _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    passport = require( 'passport' ),
    passportHttpBearer = require( 'passport-http-bearer' ),
    google = require( 'googleapis' ),
    moment = require( 'moment' );


// Dependencies
var logger = require( '../lib/logger' ),
    db = require( '../../data' ),
    router = require( '../lib/router' ),
    utils = require( '../lib/utils' ),
    ResponseError = require( '../lib/response-error' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    GoogleAuthorizer = require( '../lib/google-authorizer' ),
    Ribot = require( '../models/ribot' ),
    AccessToken = require( '../models/access-token' );


var googlePlus = google.plus( 'v1' );


utils.promisify( googlePlus.people );


/**
 * Initialise
 */
var init = function init() {

  passport.use( new passportHttpBearer.Strategy( {}, findPersonByAccessToken ) );

  router.post( '/auth/sign-in',
    middleware.validateBody,
    requestPostSignIn );

};


/**
 * Passport Bearer handler: Find user by access token
 */
var findPersonByAccessToken = function findPersonByAccessToken( accessToken, done ) {
  return AccessToken.fetchAndSetLastUsedDate( { token: accessToken }, { withRelated: [ 'ribot' ] } )
    .then( function( accessToken ) {
      var user = {};

      if ( accessToken ) {

        user.accessToken = accessToken;
        user.ribot = accessToken.related( 'ribot' );

        done( null, user );

      } else {
        done( null, false );
      }

    } )
    .catch( function( error ) {
      done( error );
    } );
};


/**
 * Get main email address from Google profile
 */
var getMainEmailFromProfile = function getMainEmailFromProfile( emails ) {
  if ( !emails ) {
    return null;
  }
  return _.find( emails, { type: 'account' } ).value;
};


/**
 * Get Google+ profile
 */
var getGoogleProfile = function getGoogleProfile( googleAuthorizer ) {
  return googlePlus.people.getPromise( {
    userId: 'me',
    auth: googleAuthorizer.client
  } )
    .then( function( args ) {
      return args[ 0 ];
    } )
    .catch( function( error ) {
      throw new ResponseError( 'google', {
        message: error.message,
        statusCode: error.code
      } );
    } );
};


/**
 * Create Sign-in resource
 */
var createSignInResource = function createSignInResource( result ) {
  var ribotJson = result.ribot.toJSON(),
      accessTokenJson = result.accessToken.toJSON();

  return {
    accessToken: accessTokenJson.accessToken,
    ribot: {
      profile: ribotJson
    }
  };
};


/**
 * Request POST
 * Receive user auth code and post to Google to swap for access and refresh tokens
 */
var requestPostSignIn = function requestPostSignIn( request, response, next ) {
  var result = {},
      googleAuthorizer = new GoogleAuthorizer( { googleRedirectUri: request.body.googleRedirectUri } );

  handleResponse( response,

    db.bookshelf.transaction( function( transaction ) {
      return Promise.try( function() {
        return googleAuthorizer.getTokens( request.body.googleAuthorizationCode )
          .tap( function cacheTokens( tokens ) { result.tokens = tokens; } )
          .catch( function( error ) {
            throw new ResponseError( error.cause.type );
          } );
      } )

      .then( function() {
        return getGoogleProfile( googleAuthorizer )
          .tap( function storeProfile( profile ) {
            result.profile = profile;
          } );
      } )

      .then( function( profile ) {
        return Ribot.findByEmail( getMainEmailFromProfile( profile.emails ), { transacting: transaction } )
          .tap( function cacheRibot( ribot ) { result.ribot = ribot; } );
      } )

      .then( function() {
        return result.ribot.createOrUpdateProviderCredential( { provider: 'google' }, {
          provider: 'google',
          accessToken: result.tokens.access_token,
          refreshToken: result.tokens.refresh_token,
          expiryDate: moment( parseInt( result.tokens.expiry_date, 10 ) )
        }, { transacting: transaction } );
      } )

      .then( function() {
        return result.ribot.createAccessToken( { transacting: transaction } )
          .tap( function cacheToken( accessToken ) { result.accessToken = accessToken; } );
      } );
    } )

    .then( function() {

      var responseBody = createSignInResource( result );
      response.status( 200 ).send( responseBody );

    } )

  );

};


// Initialise
init();


// Exports
//
