// Set up code coverage
// require( 'blanket' )( {
//     pattern: function ( filename ) {
//         return !/node_modules/.test( filename ) && !/test/.test( filename );
//     }
// } );


// External dependencies


// Dependencies
var helpers = require( './helpers' );


/**
 * Start a new instance of the server (pointing to test db)
 */
before( function( done ) {

  helpers.blueprint.getBlueprintSchema( function( error, blueprintSchema ) {
    if ( error ) {
      return error;
    }
    this.blueprintSchema = blueprintSchema;

    helpers.db.setupForTests()
      .then( function() {
        // Start the app, letting the tests run when it is running correctly
        var app = require( '../../app' );
        app.init().then( done );
      } );
  }.bind( this ) );

} );
