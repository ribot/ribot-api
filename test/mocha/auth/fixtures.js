// Exports
module.exports = {

  // Valid auth request
  googleAuthorizationRequest: {
    'googleAuthorizationCode': '4/BfSFCF6KZ1r1TbPZIN1Xpg.8gdWkdG1WPUboiIBeO6P2m98_F8xkgI',
    'googleRedirectUri': 'urn:ietf:wg:oauth:2.0:oob',
    'device': {
      'pushToken': '123456789',
      'platform': 'android'
    }
  },

  // Valid auth callback
  googleAuthorizationResponse: {
    'access_token': 'ya29.mgBYbfPPmekL-z7k46igNmZz-869DRqrGoea4W_cmmn_nnjgVWJthsk',
    'expiry_date': 1413367374475,
    'token_type': 'Bearer',
    'refresh_token': '1/t5rdVChZ38Vtm6L3GEahYbgnHtI575h5Zv9Fveiix-c'
  },

  invalidGoogleAuthCodeResponse: {
    'error' : 'invalid_grant',
    'error_description' : 'Invalid code.'
  },

  invalidGoogleAccessToken: {
    'error': {
      'errors': [ {
        'domain': 'global',
        'reason': 'authError',
        'message': 'Invalid Credentials',
        'locationType': 'header',
        'location': 'Authorization'
      } ],
      'code': 401,
      'message': 'Invalid Credentials'
    }
  },

  // Valid profile callback
  googleProfileResponse: {
    kind: 'plus#person',
    gender: 'male',
    objectType: 'person',
    id: '106445128896855937497',
    displayName: 'Robert Douglas',
    name: {
      familyName: 'Douglas',
      givenName: 'Robert'
    },
    emails: [ {
      value: 'rob@ribot.co.uk',
      type: 'account'
    } ],
    url: 'https://plus.google.com/106445128896855937497',
    image: {
      url: 'https://lh6.googleusercontent.com/-1XFPpuY1f4U/AAAAAAAAAAI/AAAAAAAAABY/g-tcx8becI4/photo.jpg?sz=50',
      isDefault: false
    },
    isPlusUser: true,
    circledByCount: 18,
    verified: false
  },

  // Layer nonce
  layerSignature: {
    nonce: "keyboardcat"
  }

};
