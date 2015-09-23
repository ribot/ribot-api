// External dependencies
//


// Dependencies
//


var errors = {
  'notFound': {
    message: 'Unknown resource. Please double check the request URL!',
    statusCode: 404
  },
  'invalidData': {
    message: 'Invalid request data!',
    statusCode: 400
  },
  'invalidGoogleCode': {
    message: 'The user\'s Google authorization code is not valid.',
    statusCode: 400,
    aliases: [
      'invalid_grant'
    ]
  },
  'google': {
    message: 'Could not communicate with Google.',
    statusCode: 500
  },
  'notImplemented': {
    message: 'We haven\'t got round to that one yet.',
    statusCode: 501
  },
  'unknown': {
    message: 'Oh dear.',
    statusCode: 500,
    aliases: [
      'wtf'
    ]
  }
};


// Exports
module.exports = errors;
