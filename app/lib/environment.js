// External dependencies
var dotenv = require( 'dotenv' );

// Local variables
var environmentName = process.env.NODE_ENV || process.env.node_env || 'development';

// Use .env file for development and test
if ( environmentName === 'development' || environmentName === 'test' ) {
  dotenv.load();
}

var environment = {
  project: 'ribot API',
  name: environmentName,
  baseUrl: process.env.BASE_URL,
  port: process.env.PORT
};

// Exports
module.exports = environment;
