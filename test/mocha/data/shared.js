// Dependencies
var _ = require( 'lodash' ),
    helpers = require( '../helpers' ),
    commonTests = require( '../helpers/shared' ),
    db = require( '../../../data' );


// Exported object
var shared = {

  shouldHaveSchemaVersion: function shouldHaveSchemaVersion( schemaVersion ) {
    var schemaVersionString = schemaVersion.toString();

    it( 'should have the schema version ' + schemaVersionString, function( done ) {
      db.getSchemaVersion()
        .then( function( result ) {
          result.value.should.be.equal( schemaVersionString );
          done();
        });
    } );
  },

  shouldHaveEmailColumn: function shouldHaveEmailColumn() {
    it( 'should have the email column', function( done ) {
      db.knex.schema.hasColumn( 'ribot', 'email' )
        .then( function( hasColumn ) {
          hasColumn.should.be.true();
          done();
        } );
    } );
  },

  shouldHaveHexColorColumn: function shouldHaveHexColorColumn() {
    it( 'should have the hex color column', function( done ) {
      db.knex.schema.hasColumn( 'ribot', 'hex_color' )
        .then( function( hasColumn ) {
          hasColumn.should.be.true();
          done();
        } );
    } );
  }

};


// Export
module.exports = _.extend( commonTests, shared );
