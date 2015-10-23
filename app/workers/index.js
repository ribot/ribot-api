// External dependencies
//


// Dependencies
var environment = require( '../lib/environment' );


/**
 * Initialise
 */
var init = function init() {

  // Workers are disabled wehn we're testing
  if ( environment.name === 'test' ) {
    return;
  }

  require( './daily-check-out' );

};

// Initialise
init();

// Exports
//
