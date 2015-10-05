// External dependencies
var should = require( 'should' ),
    _ = require( 'lodash' );


// Dependencies
var db = require( '../../../data' ),
    baseSchema = require( './migrations/base-schema' ),
    latestSchema = require( '../../../data/schema' ),
    migrations = require( '../../../data/migrations' );


/**
 * Returns an array of the migrations that need to be run to get from version 1 to the latest version
 */
var migrationNumbers = function migrationNumbers() {
  return _.range( 1, latestSchema.version )
    .map( function( migration ) {
      return migration + 1;
    } );
};


// Start the tests
describe( 'Database Migrations', function( done ) {

  it( 'should have migrations all the way up to the current schema version', function() {

    // Check that the migrations list has a migration for each step from version 2 up to the latest version
    _.each( migrationNumbers(), function( migrationNumber ) {
      migrations.should.have.property( migrationNumber ).which.is.a.Function();
    } );

  } );

  it( 'should be able to run all migrations without error', function( done ) {

    db.dropTables( latestSchema.schema )
      .then( function() {
        return db.dropTables( baseSchema.schema );
      } )
      .then( function() {
        return db.createTables( baseSchema );
      } )
      .then( function() {
        return db.migrateDatabase( migrations, 1, latestSchema.version );
      } )
      .then( function() {
        return db.getSchemaVersion()
      } )
      .then( function( schamaVersion ) {
        schamaVersion.value.should.be.eql( latestSchema.version.toString() );
        done();
      } );

  } )

} );
