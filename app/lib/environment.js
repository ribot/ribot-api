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
  port: process.env.PORT,
  logLevel: process.env.LOG_LEVEL,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    connection: process.env.DATABASE_URL,
    debug: ( process.env.DATABASE_DEBUG === 'true' ) ? true : false
  },
  google: {
    provider: process.env.GOOGLE_PROVIDER || 'googleapis',
    baseUrl: process.env.GOOGLE_API_BASE_URL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
};

// Exports
module.exports = environment;
