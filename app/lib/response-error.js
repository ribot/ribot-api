// External dependencies
var _ = require( 'lodash' );


// Dependencies
var errorHash = require( './response-error-list' );


/**
 * Family Time error constructor
 * If code is provided, do error lookup by code
 */
var ResponseError = function ResponseError( code, options ) {
  var baseError = {};

  options = options || {};

  // Map alias to code
  code = _.findKey( errorHash, function ( error ) {
    return _.find( error.aliases, function ( errorAlias ) {
      return errorAlias === code;
    } );
  } ) || code;

  baseError = Object.create( errorHash[ ( errorHash.hasOwnProperty( code ) ? code : 'unknown' ) ] );

  this.code = options.code || code;
  this.message = options.message || baseError.message;
  this.statusCode = options.statusCode || baseError.statusCode;
  this.errors = options.errors || [];

  return this;
};

ResponseError.prototype = Object.create( Error.prototype );


// Exports
module.exports = ResponseError;
