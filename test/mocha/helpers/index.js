// External dependencies
var url = require( 'url' ),
    Promise = require( 'bluebird' ),
    _ = require( 'lodash' ),
    request = require( 'request' ),
    fs = require( 'fs' ),
    BlueprintSchema = require( 'api-blueprint-json-schema' ),
    moment = require( 'moment' ),
    nock = require( 'nock' );


// Dependencies
var environment = require( '../../../app/lib/environment' ),
    schema = require( '../../../data/schema' ),
    db = require( '../../../data' ),
    seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' ),
    defaultErrorSchema = require( '../../../app/lib/default-error-schema' );


var apiUrl = environment.baseUrl;


// Helper functions
var handleResponse = function handleResponse( error, response, done ) {

  if ( error ) { return done( error ); }

  // Cache result for assertions
  this.response = response;

  done();

};


// Exports
var helpers = {

  db: {

    setupForTests: function setupForTests() {

      return db.dropTables( schema.schema )
        .bind( db )
        .then( function() {
          return db.createTables( schema, seed );
        } );
    },

    fetch: db.fetch.bind( db )

  },

  blueprint: {

    getBlueprintSchema: function getBlueprintSchema( done ) {

      fs.readFile( __dirname + '/../../../spec/blueprint.md', function( error, markdown ) {
        var blueprint = markdown.toString();

        BlueprintSchema.create( blueprint, {
          defaultErrorSchema: defaultErrorSchema
        }, function ( error, blueprintSchema ) {
          return done( error, blueprintSchema );
        } );

      } );

    }

  },

  nock: {

    instance: nock,

    setInterceptor: function( options ) {
      var scope,
          url = options.url || environment.google.baseUrl,
          body = options.body || '*',
          times = options.times || 1;

      scope = nock( url )
        .filteringPath( function() { return options.path; } )
        .filteringRequestBody( function() { return body; } );

      if ( options.persist ) {
        scope.persist();
      }

      scope
        .intercept( options.path, options.method, body )
        .times( times )
        .reply( options.statusCode, options.response );

      return scope;
    },

    removeInterceptor: function( options ) {
      nock.removeInterceptor( {
        hostname : options.hostname,
        path : options.path
      } );
    },

    setAuthorizationResponse: function( statusCode, response ) {
      return this.setInterceptor( {
        url: 'https://accounts.google.com',
        path: '/o/oauth2/token',
        body: '*',
        method: 'post',
        statusCode: statusCode,
        response: response,
        times: 2
      } );
    },

    cleanAuthorizationResponse: function() {
      nock.removeInterceptor( {
        hostname: 'accounts.google.com',
        path: '/o/oauth2/token',
        method: 'post',
        proto: 'https'
      } );
    },

    setAuthorizationSuccessResponse: function( response ) {
      return this.setAuthorizationResponse( 200, response );
    },

    setAuthorizationFailureResponse: function( response ) {
      this.setAuthorizationResponse( 400, response );
    },

    setProfileSuccessResponse: function( response ) {
      return this.setInterceptor( {
        path: '/plus/v1/people/me',
        method: 'get',
        statusCode: 200,
        response: response
      } );
    },

    cleanProfileResponse: function() {
      nock.removeInterceptor( {
        hostname: 'accounts.google.com',
        path: '/plus/v1/people/me',
        method: 'get',
        proto: 'https'
      } );
    }

  },

  request: function ( options, done ) {
    var requestOptions = {},
        requestObject,
        requestForm;

    requestOptions.url = apiUrl + options.route;
    requestOptions.qs = options.query || {};
    requestOptions.method = options.method;
    requestOptions.headers = options.headers || {};
    requestOptions.json = true;

    if ( options.hasOwnProperty( 'body' ) && options.method !== 'get' ) {
      requestOptions.body = options.body;
    }

    requestObject = request( requestOptions, function( error, response, body ) {
      handleResponse.call( this, error, response, done );
    }.bind( this ) );

    if ( options.hasOwnProperty( 'multipart' ) && options.method !== 'get' ) {
      requestForm = requestObject.form();
      _.each( options.multipart, function( item, key ) {
        requestForm.append( key, item.value, item.options );
      } );
    }

    return requestObject;
  },

  /**
   * Is valid date utility
   */
  isValidDate: function( date ) {
    return moment( date, [ 'ddd, DD MMM YYYY HH:mm:ss ZZ' ] ).isValid();
  }

};

// Exports
module.exports = helpers;
