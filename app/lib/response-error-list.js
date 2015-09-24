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
  'invalidRedirectUri': {
    message: 'The redirect uri does not match for the code provided. Did you forget to send the optional `googleRedirectUri` property in the request?.',
    statusCode: 400,
    aliases: [
      'redirect_uri_mismatch'
    ]
  },
  'google': {
    message: 'Could not communicate with Google.',
    statusCode: 500
  },
  'noProfile': {
    message: 'Google Auth was successful, but the user does not have a ribot profile set up.',
    statusCode: 403
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
