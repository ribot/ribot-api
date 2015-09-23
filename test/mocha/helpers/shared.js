// External dependencies
var moment = require( 'moment' ),
    _ = require( 'lodash' );


// Dependencies
var helpers = require( './index' ),
    ResponseError = require( '../../../app/lib/response-error' ),
    seed = require( '../../../data/seed' ),
    utils = require( '../../../app/lib/utils' );


// Error tests
var shouldRespondWithCorrectError = function shouldRespondWithCorrectError() {
  it( 'should return the correct error', function() {
    // Assertions
    this.response.statusCode.should.eql( this.expectedStatusCode );
    this.response.body.should.have.properties( { code: this.expectedError.code, message: this.expectedError.message } );
  } );
};


var shouldRespondWithCorrectStatusCode = function shouldRespondWithCorrectStatusCode() {
  it( 'should return the correct (success) status code', function() {
    // Assertions
    this.response.statusCode.should.eql( this.expectedStatusCode );
  } );
};


// Response/error schema tests
var shouldReturnValidErrorSchema = function shouldReturnValidErrorSchema(){
  it( 'should validate error against the blueprint schema', function( done ) {

    var options = { type: 'response', route: this.blueprintRoute || this.route, method: this.method, statusCode: this.expectedStatusCode };

    // Validate response against blueprint schema
    this.blueprintSchema.validate( this.response.body, options, function( error, result ) {

      if ( error ) { return done( error ); }

      // Blueprint assertions
      result.errors.should.have.a.lengthOf(0);

      done();

    } );

  } );
};


var shouldReturnValidResponseSchema = function shouldReturnValidResponseSchema() {
  it( 'should validate successful response against the blueprint schema', function( done ) {

    var options = { type: 'response', route: this.blueprintRoute || this.route, method: this.method, statusCode: this.expectedStatusCode };

    // Validate response against blueprint schema
    this.blueprintSchema.validate( this.response.body, options, function( error, result ) {

      if ( error ) { return done( error ); }

      // Blueprint assertions
      result.errors.should.have.a.lengthOf(0);

      done();

    } );

  } );
};


var shouldUpdateAccessTokensLastUsedDate = function shouldUpdateAccessTokensLastUsedDate() {
  it( 'should update access token\'s lastUsedDate to track access activity', function( done ) {

    helpers.db.fetch( 'access_token', { token: this.accessToken.token } )
    .then( function( results ) {
      var result = results[ 0 ];

      moment( result.last_used_date ).isAfter( this.accessToken.last_used_date ).should.be.true;

      done();

    }.bind( this ) )
    .catch( function( error ) {

      done( error );

    } );

  } );
};


// Export
module.exports = {
  shouldRespondWithCorrectError: shouldRespondWithCorrectError,
  shouldRespondWithCorrectStatusCode: shouldRespondWithCorrectStatusCode,
  shouldReturnValidErrorSchema: shouldReturnValidErrorSchema,
  shouldReturnValidResponseSchema: shouldReturnValidResponseSchema,
  shouldUpdateAccessTokensLastUsedDate: shouldUpdateAccessTokensLastUsedDate
};
