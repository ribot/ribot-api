// Dependencies
var hat = require( 'hat' ),
    seed = require( '../../../data/seed' );


// Exports
module.exports = {

  performCheckInBodyWithLabel: {
    "label": "Home"
  },
  performCheckInBodyWithAndLocation: {
    "label": "Home",
    "latitude": 0,
    "longitude": 0
  },
  performCheckInBodyOnlyLatitude: {
    "label": "Home",
    "latitude": 0
  },
  performCheckInBodyOnlyLongitude: {
    "label": "Home",
    "longitude": 0
  },
  performCheckInBodyInvalidNoLabel: {
    "latitude": -91,
    "longitude": 0
  },
  performCheckInBodyInvalidLatitudeLow: {
    "label": "Home",
    "latitude": -91,
    "longitude": 0
  },
  performCheckInBodyInvalidLatitudeHigh: {
    "label": "Home",
    "latitude": -91,
    "longitude": 0
  },
  performCheckInBodyInvalidLongitudeLow: {
    "label": "Home",
    "latitude": 0,
    "longitude": -181
  },
  performCheckInBodyInvalidLongitudeHigh: {
    "label": "Home",
    "latitude": 0,
    "longitude": 181
  },
  performCheckInBodyInvalidExtraProperty: {
    "label": "Home",
    "latitude": 0,
    "longitude": 0,
    "notInSchema": "MUHAHA"
  },
  performCheckInBodyWithVenueId: {
    "venueId": seed.venue[0].id
  },
  performCheckInBodyWithInvalidVenueId: {
    "venueId": hat()
  },

  performCheckOutBody: {
    "isCheckedOut": true
  },
  performCheckOutBodyInvalid: {
    "label": "A new name"
  }

};
