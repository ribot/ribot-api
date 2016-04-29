// External dependencies
var url = require( 'url' ),
    _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    passport = require( 'passport' ),
    passportHttpBearer = require( 'passport-http-bearer' ),
    google = require( 'googleapis' ),
    moment = require( 'moment' ),
    jwt = require( 'jsonwebtoken' );


// Dependencies
var logger = require( '../lib/logger' ),
    db = require( '../../data' ),
    router = require( '../lib/router' ),
    utils = require( '../lib/utils' ),
    ResponseError = require( '../lib/response-error' ),
    handleResponse = require( '../lib/response-error-handler' ),
    middleware = require( '../lib/routing-middleware' ),
    GoogleAuthorizer = require( '../lib/google-authorizer' ),
    Consumer = require( '../models/consumer' ),
    Ribot = require( '../models/ribot' ),
    AccessToken = require( '../models/access-token' );


var googlePlus = google.plus( 'v1' );


utils.promisify( googlePlus.people );
utils.promisify( jwt );


/**
 * Initialise
 */
var init = function init() {

  passport.use( new passportHttpBearer.Strategy( {}, authenticate ) );

  router.post( '/auth/sign-in',
    middleware.validateBody,
    requestPostSignIn );

};


/**
 * Passport Bearer handler: Find client scopes and user by access token
 */
var authenticate = function authenticate( token, done ) {
  var result = {};

  return findAndVerifyConsumer( token )
    .tap( function( consumer ) {
      result.consumer = consumer;
    } )
    .then( function() {
      var decodedToken = jwt.decode( token );
      return findPersonByAccessToken( decodedToken.accessToken );
    } )
    .then( function( ribot ) {
      if ( !_.isEmpty( ribot ) ) {
        result.ribot = ribot;
      }
      done( null, result );
    } )
    .catch( ResponseError, function( error ) {
      done( null, false );
    } )
    .catch( function( error ) {
      done( error );
    } );

};


/**
 * Find and verify consumer
 */
var findAndVerifyConsumer = function findAndVerifyConsumer( token ) {
  var results = {};

  return Promise.try( function() {
    return jwt.decode( token );
  } )
    .tap( function( decodedToken ) {
      if ( !decodedToken ) { throw new Error( 'Invalid JWT: ' + token ); }
    } )
    .then( function( decodedToken ) {
      return Consumer.find( { id: decodedToken.key } );
    } )
    .tap( function( consumer ) {
      var decodedSecret = utils.decodeToken( consumer.get( 'secret' ) )
      return jwt.verifyPromise( token, decodedSecret, {
        ignoreExpiration: true
      } );
    } )
    .catch( function( error ) {
      logger.error( error );
      throw new ResponseError( 'unauthorized' );
    } )
};


/**
 * Find user by access token
 */
var findPersonByAccessToken = function findPersonByAccessToken( accessToken ) {
  return AccessToken.fetchAndSetLastUsedDate( { token: accessToken }, { withRelated: [ 'ribot' ] } )
    .then( function( accessToken ) {

      if ( accessToken ) {
        return Promise.resolve( accessToken.related( 'ribot' ) );
      } else {
        throw new ResponseError( 'unauthorized' );
      }

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
