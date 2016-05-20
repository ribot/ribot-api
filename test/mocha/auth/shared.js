// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    utils = require( '../../../app/lib/utils' );


// Exported object
var shared = {

  shouldHaveUserInDatabase: function shouldHaveUserInDatabase() {
    it( 'should create a user in the database', function( done ) {
      // Response assertions
      helpers.db.fetch( 'ribot', { email: this.googleProfileResponse.emails[ 0 ].value } )
      .then( function( results ) {

        results.length.should.eql( 1 );
        results[ 0 ].should.have.properties( {
          first_name: this.googleProfileResponse.name.givenName,
          last_name: this.googleProfileResponse.name.familyName,
          is_authenticated: true
        } );
        done();

      }.bind( this ) )
      .catch( function( error ) {
        done( error );
      } );

    } );
  },

  shouldNotHaveUserInDatabase: function shouldNotHaveUserInDatabase() {
    it( 'should not create a user in the database', function( done ) {
      // DB assertions
      helpers.db.fetch( 'ribot', { email: this.googleProfileResponse.emails[ 0 ].value } ).bind( this )
      .then( function( results ) {

        results.should.be.empty;
        done();

      } )
      .catch( function( error ) {
        done( error );
      } );

    } );
  },

  shouldReturnAccessTokenAndUserProfile: function shouldReturnAccessTokenAndUserProfile() {
    it( 'should return an access token and user profile', function() {
      // Response assertions
      this.response.body.should.have.property( 'accessToken' ).and.be.type( 'string' );
      this.response.body.should.have.propertyByPath( 'ribot', 'profile' );
      this.response.body.should.have.propertyByPath( 'ribot', 'profile', 'name' )
        .and.have.properties( {
          first: this.googleProfileResponse.name.givenName,
          last: this.googleProfileResponse.name.familyName
        } );
    } );
  },

  shouldHaveAccessTokenInDatabase: function shouldHaveAccessTokenInDatabase() {
    it( 'should save application access token in the database', function( done ) {
      // Response assertions
      helpers.db.fetch( 'access_token', { token: utils.encodeToken( this.response.body.accessToken ) } )
      .then( function( results ) {

        results.length.should.eql( 1 );
        done();

      }.bind( this ) )
      .catch( function( error ) {
        done( error );
      } );

    } );
  },

  shouldNotHavePreviousAccessTokenInDatabase: function shouldNotHavePreviousAccessTokenInDatabase() {
    it( 'should no longer have previous application access token in the database', function( done ) {
      // Response assertions
      helpers.db.fetch( 'access_token', { token: this.existingApplicationAccessToken } )
      .then( function( results ) {

        results.length.should.eql( 0 );
        done();

      }.bind( this ) )
      .catch( function( error ) {
        done( error );
      } );

    } );
  },

  shouldHaveGoogleAccessTokenInDatabase: function shouldHaveGoogleAccessTokenInDatabase() {
    it( 'should save Google access and refresh tokens in the database', function( done ) {
      // Response assertions
      helpers.db.fetch( 'provider_credential', { provider: 'google', access_token: this.googleAuthorizationResponse.access_token } ).bind( this )
      .then( function( results ) {

        results.length.should.eql( 1 );
        results[ 0 ].access_token.should.not.eql( this.existingGoogleAccessToken );
        done();

      }.bind( this ) )
      .catch( function( error ) {
        done( error );
      } );

    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
