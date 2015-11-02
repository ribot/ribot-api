// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    underscoreDeepExtend = require( 'underscore-deep-extend' ),
    underscoreString = require( 'underscore.string' ),
    validate = require( 'validate.js' ),
    validator = require( 'validator' ),
    moment = require( 'moment' ),
    jwt = require( 'jwt-simple' ),
    uuid = require( 'node-uuid' );


// Dependencies
var ResponseError = require( './response-error' ),
    environment = require( './environment' );


/**
 * Initialise
 */
var init = function init() {

  // Augment underscore with deepExtend method
  _.mixin( {
    deepExtend: underscoreDeepExtend( _ ),
    thru: function thru( obj, interceptor ) {
      return interceptor( obj );
    }
  } );

  // Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
  _.str = underscoreString;

  // Mix in non-conflict functions to Underscore namespace if you want
  _.mixin( _.str.exports() );

  // Custom UUID validator
  validate.validators.uuid = function uuidValidator( value, options, key, attributes ) {
    if ( value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test( value ) && !validator.isUUID( value ) ) {
      return 'is not a valid UUID';
    }
  };

  // Custom date validator
  validate.validators.date = function dateValidator( value, option, key, attributes ) {
    if ( value && !moment( value ).isValid() ) {
      return 'is not a valid date';
    }
  };

  // Custom URL validator
  validate.validators.url = function urlValidator( value, options, key, attributes ) {
    if ( value && !validator.isURL( value ) ) {
      return 'is not a valid URL';
    }
  };

  // Custom enum validator
  validate.validators.enu = function enuValidator( value, options, key, attributes ) {
    if ( value && options.length && !_.contains( options, value ) ) {
      return 'must have a value of: ' + options.toString();
    }
  };

  // Custom hex color validator
  validate.validators.hexColor = function hexColor( value, options, key, attributes ) {
    if ( value && !/^#(?:[0-9a-f]{3}){1,2}$/i.test( value ) ) {
      return 'must be a valid hex code';
    }
  };

};


/**
 * Format date
 * Uses ISO-8601 with no time component
 */
var formatDate = function formatDate( date ) {
  return moment( date ).format( 'YYYY-MM-DD' );
};


/**
 * Format date with time
 * Uses ISO-8601 format
 */
var formatDateTime = function formatDateTime( date ) {
  return moment( date ).toISOString();
};


/**
 * Promisify all functions on an object, with a suffix of 'Promise'
 * e.g. someMethod => someMethodPromise
 */
var promisify = function promisify( obj ) {
  return Promise.promisifyAll( obj, { suffix: 'Promise' } );
};


/**
 * Encodes a given payload (objects/arrays will be JSON stringified)
 */
var encodeToken = function encodeToken( payload ) {
  var token = jwt.encode( payload, environment.jwtSecret );
  return token;
};


/**
 * Decodes a token back into a payload
 */
var decodeToken = function decodeToken( token ) {
  var decoded = jwt.decode( token, environment.jwtSecret );
  return decoded;
};


/**
 * Generate a UUID
 */
var createUuid = function createUuid() {
  return uuid.v4();
};


// Initialise
init();


// Exports
module.exports = {
  formatDate: formatDate,
  formatDateTime: formatDateTime,
  promisify: promisify,
  encodeToken: encodeToken,
  decodeToken: decodeToken,
  createUuid: createUuid
};
