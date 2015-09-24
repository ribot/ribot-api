// External dependencies
var should = require( 'should' ),
    promised = require( 'should-promised' );


// Dependencies
var db = require( '../../../data' ),
    schema = require( '../../../data/schema' ),
    fixtures = require( './fixtures' ),
    shared = require( './shared' );

// Local variables


// Start the tests
describe( 'Database', function( done ) {

  describe( 'Handle fresh database', function( done ) {

    before( function( done ) {

      db.dropTables( schema.schema )
        .then( function() {
          return db.dropTables( fixtures.schema3.schema );
        } )
        .then( function() {
          return db.setupDatabase( fixtures.schema3, fixtures.migrations );
        } )
        .then( function() {
          done();
        } );

    } );

    shared.shouldHaveSchemaVersion( 3 );
    shared.shouldHaveEmailColumn();
    shared.shouldHaveHexColorColumn();

  } );

  describe( 'Handle database schema equal to the code schema', function( done ) {

    before( function( done ) {

      db.dropTables( schema.schema )
        .then( function() {
          return db.dropTables( fixtures.schema3.schema );
        } )
        .then( function() {
          return db.createTables( fixtures.schema3 );
        } )
        .then( function() {
          return db.setupDatabase( fixtures.schema3, fixtures.migrations );
        } )
        .then( function() {
          done();
        } );

    } );

    shared.shouldHaveSchemaVersion( 3 );
    shared.shouldHaveEmailColumn();
    shared.shouldHaveHexColorColumn();

  } );

  describe( 'Handle database schema older than the code schema by a single version', function( done ) {

    before( function( done ) {

      db.dropTables( schema.schema )
        .then( function() {
          return db.dropTables( fixtures.schema3.schema );
        } )
        .then( function() {
          return db.createTables( fixtures.schema2 );
        } )
        .then( function() {
          return db.setupDatabase( fixtures.schema3, fixtures.migrations );
        } )
        .then( function() {
          done();
        } );

    } );

    shared.shouldHaveSchemaVersion( 3 );
    shared.shouldHaveEmailColumn();
    shared.shouldHaveHexColorColumn();

  } );

  describe( 'Handle database schema older than the code schema by multiple versions', function( done ) {

    before( function( done ) {

      db.dropTables( schema.schema )
        .then( function() {
          return db.dropTables( fixtures.schema3.schema );
        } )
        .then( function() {
          return db.createTables( fixtures.schema1 );
        } )
        .then( function() {
          return db.setupDatabase( fixtures.schema3, fixtures.migrations );
        } )
        .then( function() {
          done();
        } );

    } );

    shared.shouldHaveSchemaVersion( 3 );
    shared.shouldHaveEmailColumn();
    shared.shouldHaveHexColorColumn();

  } );

  describe( 'Handle database schema newer than the code schema', function( done ) {

    before( function( done ) {

      db.dropTables( schema.schema )
        .then( function() {
          return db.dropTables( fixtures.schema3.schema );
        } )
        .then( function() {
          return db.createTables( fixtures.schema4 );
        } )
        .then( function() {
          done();
        } );

    } );

    it( 'should reject the promise and fail to start the server', function( done ) {

      db.setupDatabase( fixtures.schema3, fixtures.migrations )
        .should.be.rejected()
        .then( function() {
          done();
        } );

    } );
  } );

} );
