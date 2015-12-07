// External Dependencies
var moment = require( 'moment' ),
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
      return utils.createUuid();
    } );


var seedData = {

  consumer: [
    { id: uuids[ 0 ], name: 'Test app', scope_list: 'user checkIn', secret: utils.encodeToken( uuids[ 0 ] ), created_date: date, updated_date: date },
    { id: uuids[ 1 ], name: 'Test app 2', scope_list: 'checkIn', secret: utils.encodeToken( uuids[ 1 ] ), created_date: date, updated_date: date }
  ],

  ribot: [
    { id: uuids[ 0 ], first_name: 'Robert', last_name: 'Douglas', email: 'rob@douglas.com', date_of_birth: '1970-01-01', avatar: 'http://exmaple.com/avatar.png', hex_color: '#C0FFEE', is_authenticated: true, created_date: date, updated_date: date },
    { id: uuids[ 1 ], first_name: 'Matt', last_name: 'Oakes', email: 'matt@ribot.co.uk', date_of_birth: '1970-02-02', avatar: 'http://exmaple.com/avatar2.png', hex_color: '#C0FFEE', is_authenticated: false, created_date: date, updated_date: date }
  ],

  access_token: [
    { id: uuids[ 0 ], ribot_id: uuids[ 0 ], token: utils.encodeToken( uuids[ 0 ] ), last_used_date: date, created_date: date, updated_date: date },
    { id: uuids[ 1 ], ribot_id: uuids[ 1 ], token: utils.encodeToken( uuids[ 1 ] ), last_used_date: date, created_date: date, updated_date: date }
  ],

  provider_credential: [
    { id: uuids[ 0 ], ribot_id: uuids[ 0 ], provider: 'google', access_token: '123', refresh_token: '234', expiry_date: futureDate, created_date: date, updated_date: date }
  ],

  venue: [
    { id: uuids[ 0 ], label: 'Home', latitude: -10, longitude: 70, created_date: date, updated_date: date },
    { id: uuids[ 1 ], label: 'Studio', created_date: date, updated_date: date }
  ],

  zone: [
    { id: uuids[ 0 ], label: 'Desks', venue_id: uuids[ 1 ], created_date: date, updated_date: date },
    { id: uuids[ 1 ], label: 'Vault', venue_id: uuids[ 1 ], created_date: date, updated_date: date }
  ],

  beacon: [
    { id: uuids[ 5 ], uuid: uuids[ 0 ], major: 1, minor: 1, zone_id: uuids[ 0 ], created_date: date, updated_date: date },
    { id: uuids[ 6 ], uuid: uuids[ 0 ], major: 1, minor: 2, zone_id: uuids[ 0 ], created_date: date, updated_date: date },
    { id: uuids[ 7 ], uuid: uuids[ 0 ], major: 2, minor: 1, zone_id: uuids[ 1 ], created_date: date, updated_date: date }
  ],

  check_in: [
    { id: uuids[ 1 ], ribot_id: uuids[ 1 ], label: 'ribot studio', created_date: date, updated_date: date }
  ]

};


// Exports
module.exports = seedData;
