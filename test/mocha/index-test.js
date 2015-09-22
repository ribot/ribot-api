// External dependencies


// Dependencies
var helpers = require( './helpers' );


/**
 * Start a new instance of the server (pointing to test db)
 */
before( function( done ) {

  // Require app
  var app = require( '../../app' );

  helpers.blueprint.getBlueprintSchema( function( error, blueprintSchema ) {
    if ( error ) {
      return error;
    }
    this.blueprintSchema = blueprintSchema;
    done();
  }.bind( this ) );

} );
