// External dependencies
//


// Dependencies
var router = require( '../lib/router' );


/**
 * Initialise
 */
var init = function init() {

  require( './auth' );
  require( './beacon' );
  require( './check-in' );
  require( './drink' );
  require( './docs' );
  require( './nfc-scan' );
  require( './ribot' );
  require( './venue' );

};

// Initialise
init();

// Exports
//
