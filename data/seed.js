// External Dependencies
var hat = require( 'hat' ),
    moment = require( 'moment' ),
    _ = require( 'lodash' ),
    jwt = require( 'jwt-simple' );


// Dependencies
var logger = require( '../app/lib/logger' ),
    environment = require( '../app/lib/environment' ),
    utils = require( '../app/lib/utils' );


// Dependencies
var logger = require( '../app/lib/logger' ),
    environment = require( '../app/lib/environment' ),
    utils = require( '../app/lib/utils' );


// Local variables
var date = moment().format(),
    futureDate = moment().add( 1, 'years' ),
    uuids = _.times( 20, function() {
      return hat();
    } );

var seedData = {

  ribot: [
    { id: uuids[ 0 ], first_name: 'Robert', last_name: 'Douglas', email: 'rob@douglas.com', is_authenticated: true, created_date: date, updated_date: date }
  ],

  access_token: [
    { id: uuids[ 0 ], ribot_id: uuids[ 0 ], token: utils.encodeToken( uuids[ 0 ] ), last_used_date: date, created_date: date, updated_date: date }
  ],

  provider_credential: [
    { id: uuids[ 0 ], ribot_id: uuids[ 0 ], provider: 'google', access_token: '123', refresh_token: '234', expiry_date: futureDate, created_date: date, updated_date: date }
  ],

};


// Exports
module.exports = seedData;
