// External dependencies
var http = require( 'http' ),
    url = require( 'url' ),
    should = require( 'should' ),
    _ = require( 'lodash' ),
    fs = require( 'fs' ),
    BlueprintSchema = require( 'api-blueprint-json-schema' ),
    hat = require( 'hat' );


// Dependencies
var environment = require( '../../../app/lib/environment' ),
    ResponseError = require( '../../../app/lib/response-error' ),
    helpers = require( '../helpers' ),
    fixtures = require( './fixtures' ),
    seed = require( '../../../data/seed' ),
    shared = require( './shared' );


// Local variables
var apiUrl = environment.baseUrl,
    getValidAuthCode = hat,
    blueprintSchema;


// Start the tests
describe( 'Authentication: /auth/sign-in', function( done ) {

  before( function( done ) {
    // Set common scope
    this.route = '/auth/sign-in'; // Needed for blueprint validation
    this.method = 'post';
    this.googleProfileResponse = fixtures.googleProfileResponse;
    this.googleAuthorizationResponse = fixtures.googleAuthorizationResponse;

    done();
  } );

  describe( 'Handle *new* application user with valid Google authorization code', function( done ) {

    before( function( done ) {

      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {

          // Set up scope for assertions
          this.expectedStatusCode = 200;
          this.googleAuthorizationRequest = _.extend( {}, fixtures.googleAuthorizationRequest, { googleAuthorizationCode: getValidAuthCode() } );

          // Set up nock interceptors
          helpers.nock.setAuthorizationSuccessResponse( this.googleAuthorizationResponse );
          helpers.nock.setProfileSuccessResponse( this.googleProfileResponse );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            body: this.googleAuthorizationRequest
          }, done );

        }.bind( this ) );

    } );

    after( function() {
      helpers.nock.cleanAuthorizationResponse();
      helpers.nock.cleanProfileResponse();
    } );

    // Shared assertions
    shared.shouldRespondWithCorrectStatusCode();
    shared.shouldReturnAccessTokenAndUserProfile();
    shared.shouldHaveUserInDatabase();
    shared.shouldHaveGoogleAccessTokenInDatabase();
    shared.shouldHaveAccessTokenInDatabase();
    shared.shouldReturnValidResponseSchema();

  } );

  describe( 'Handle *existing* application user with valid Google authorization code', function( done ) {

    before( function( done ) {

      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {

          // Set up scope for assertions
          this.googleAuthorizationRequest = _.extend( {}, fixtures.googleAuthorizationRequest, { googleAuthorizationCode: getValidAuthCode() } );
          this.expectedStatusCode = 200;
          this.googleProfileResponse = _.extend( {}, fixtures.googleProfileResponse, { emails: [ { value: 'rob@douglas.com', type: 'account' } ] } );
          this.existingAccessToken = seed.provider_credential[ 0 ].access_token;

          // Set up nock interceptors
          helpers.nock.setAuthorizationSuccessResponse( this.googleAuthorizationResponse );
          helpers.nock.setProfileSuccessResponse( this.googleProfileResponse );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            body: this.googleAuthorizationRequest
          }, done );

      }.bind( this ) );

    } );

    after( function() {
      helpers.nock.cleanAuthorizationResponse();
      helpers.nock.cleanProfileResponse();
    } );

    shared.shouldRespondWithCorrectStatusCode();
    shared.shouldReturnAccessTokenAndUserProfile();
    shared.shouldHaveUserInDatabase();
    shared.shouldHaveGoogleAccessTokenInDatabase();
    shared.shouldHaveAccessTokenInDatabase();
    shared.shouldReturnValidResponseSchema();

  } );

  describe( 'Handle invalid google auth code', function( done ) {

    before( function( done ) {

      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {

          // Set up scope for assertions
          this.googleAuthorizationRequest = _.extend( {}, fixtures.googleAuthorizationRequest, { googleAuthorizationCode: 'invalidAuthCode' } );
          this.googleAuthorizationResponse = fixtures.invalidGoogleAuthCodeResponse;
          this.expectedError = new ResponseError( 'invalidGoogleCode' );
          this.expectedStatusCode = this.expectedError.statusCode;

          // Set up nock interceptors
          helpers.nock.setAuthorizationFailureResponse( this.googleAuthorizationResponse );
          helpers.nock.setProfileSuccessResponse( this.googleProfileResponse );

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            body: this.googleAuthorizationRequest
          }, done );

      }.bind( this ) );

    } );

    after( function() {
      helpers.nock.cleanAuthorizationResponse();
      helpers.nock.cleanProfileResponse();
    } );

    // Shared tests
    shared.shouldRespondWithCorrectError();
    shared.shouldNotHaveUserInDatabase();
    shared.shouldReturnValidErrorSchema();

  } );

  describe( 'Handle no google auth code', function( done ) {

    before( function( done ) {

      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {

          // Set up scope for assertions
          this.googleAuthorizationRequest = _.extend( {}, fixtures.googleAuthorizationRequest, { googleAuthorizationCode: null } );
          this.expectedError = new ResponseError( 'invalidData' );
          this.expectedStatusCode = this.expectedError.statusCode;

          // Make request
          helpers.request.bind( this )( {
            method: this.method,
            route: this.route,
            body: this.googleAuthorizationRequest
          }, done );

      }.bind( this ) );

    } );

    // Shared tests
    shared.shouldRespondWithCorrectError();
    shared.shouldNotHaveUserInDatabase();
    shared.shouldReturnValidErrorSchema();

  } );

  describe( 'Handle when a valid authorisation code has already been used', function( done ) {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests().then( function() { done(); } );
    } );

    it( 'should return an "invalid data" error', function( done ) {
      // Set up scope for assertions
      this.expectedStatusCode = 200;
      this.googleAuthorizationRequest = _.extend( {}, fixtures.googleAuthorizationRequest, { googleAuthorizationCode: getValidAuthCode() } );
      this.googleAuthorizationResponse = new ResponseError( 'invalidGoogleCode' );

      // Set up nock interceptors
      helpers.nock.setAuthorizationSuccessResponse( this.googleAuthorizationResponse );
      helpers.nock.setProfileSuccessResponse( this.googleProfileResponse );

      // Make request
      helpers.request.bind( this )( {
        method: this.method,
        route: this.route,
        body: this.googleAuthorizationRequest
      }, function( error, response ) {

        // Assertions
        shared.shouldRespondWithCorrectStatusCode();
        shared.shouldReturnAccessTokenAndUserProfile();

        // Set up scope for assertions
        this.expectedError = new ResponseError( 'invalidGoogleCode' );
        this.expectedStatusCode = this.expectedError.statusCode;

        // Set up nock interceptors
        helpers.nock.cleanAuthorizationResponse();
        helpers.nock.cleanProfileResponse();
        helpers.nock.setAuthorizationFailureResponse( this.googleAuthorizationResponse );

        // Make request
        helpers.request.bind( this )( {
          method: this.method,
          route: this.route,
          body: this.googleAuthorizationRequest
        }, function( error, response ) {

          if ( error ) { return done( error ); }

          shared.shouldRespondWithCorrectError();
          shared.shouldHaveUserInDatabase();
          shared.shouldHaveGoogleAccessTokenInDatabase();

          done();

        } );

      }.bind( this ) );

    } );

  } );

} );
