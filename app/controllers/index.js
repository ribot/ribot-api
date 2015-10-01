// External dependencies
//


// Dependencies
var router = require( '../lib/router' );


/**
 * Initialise
 */
var init = function init() {

  require( './auth' );
  require( './check-in' );
  require( './docs' );
  require( './ribot' );
  require( './venue' );

};

// Initialise
init();

// Exports
//
