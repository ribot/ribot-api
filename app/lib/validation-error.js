// External dependencies
var _ = require( 'lodash' );


/**
 * Validation error constructor
 */
var ValidationError = function ValidationError( errors ) {

  this.errors = _.map( errors, function( messages, key ) {
    return {
      property: key,
      messages: messages
    };
  } );

  return this;
};

ValidationError.prototype = Object.create( Error.prototype );

// Exports
module.exports = ValidationError;
