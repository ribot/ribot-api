// External dependencies
var fs = require( 'fs' ),
    BlueprintSchema = require( 'api-blueprint-json-schema' ),
    Promise = require( 'bluebird' );


// Dependencies
var blueprintMd = fs.readFileSync( __dirname + '/../../spec/blueprint.md' ).toString(),
    defaultErrorSchema = require( './default-error-schema' );


// Exports
module.exports = ( function() {
  var cachedBlueprintSchema;

  return function() {
    return new Promise( function( resolve, reject ) {

      if ( cachedBlueprintSchema === undefined ) {

        BlueprintSchema.create( blueprintMd, {
          defaultErrorSchema: defaultErrorSchema
        }, function ( error, blueprintSchema ) {

          if ( error ) {
            return reject( new Error( error ) );
          }

          cachedBlueprintSchema = blueprintSchema;

          return resolve( blueprintSchema );
        } );

      } else {
        return resolve( cachedBlueprintSchema );
      }

    } );
  };
} )();
