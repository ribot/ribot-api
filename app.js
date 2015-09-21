// External dependencies
var express = require( 'express' );


// Dependencies
var environment = require( './app/lib/environment' );


// Local variables
var app = express();


/**
 * Initialise
 */
var init = function init() {

  app.get( '/', function ( req, res ) {
    res.send( 'Hello World!' );
  } );

  var server = app.listen( environment.port, function () {
    console.log( 'Example app listening at %s', environment.baseUrl );
  } );

  console.log( environment );

};

// Get the party started
init();
