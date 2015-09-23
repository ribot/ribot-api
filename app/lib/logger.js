// External dependencies
var winston = require( 'winston' );


// Dependencies
var environment = require( './environment' );


// Local variables
var logger;

/**
 * Initialise
 */
var init = function init() {

  // Create and array contraining the console logging transport
  var transports = [ new winston.transports.Console( {
    colorize: true,
    json: true,
    level: environment.logLevel
  } ) ];

  // Create the winston logger with the correct transports and error types
  logger = new winston.Logger( {
    transports: transports,
    levels: {
      'debug': 0,
      'info': 1,
      'warn': 2,
      'error': 3
    },
    exitOnError: false
  } );

};

// Initialise
init();


// Exports
module.exports = logger;
