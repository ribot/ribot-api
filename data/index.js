// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    Knex = require( 'knex' ),
    Bookshelf = require( 'bookshelf' ),
    dependencyGraph = require( 'dependency-graph' );


// Dependencies
var environment = require( '../app/lib/environment' ),
    logger = require( '../app/lib/logger' );


// Local variables
var DepGraph = dependencyGraph.DepGraph;


/**
 * Utility to sort tables using a dependency graph
 */
var sortTables = function sortTables( schema ) {
  var depGraph = new DepGraph();

  _.each( schema, function( tableSchema, tableName ) {
    var references = _.chain( tableSchema.columns )
      .filter( function( column ) {
        return column.hasOwnProperty( 'references' );
      } )
      .pluck( 'references' )
      .pluck( 'table' )
      .value();

    if ( !depGraph.hasNode( tableName ) ) {
      depGraph.addNode( tableName );
    }

    _.each( references, function( reference ) {
      if ( !depGraph.hasNode( reference ) ) {
        depGraph.addNode( reference );
      }
      if ( tableName !== reference ) {
        depGraph.addDependency( tableName, reference );
      }
    } );

  } );

  return depGraph.overallOrder();
};

/**
 * Utility to get primary key(s) from table schema
 */
var getPrimaryKeys = function( tableSchema ) {
  return ( _.isArray( tableSchema.primary ) ? tableSchema.primary : [ tableSchema.primary ] );
};


/**
 * Db constructor
 */
var Db = function Db() {

  this.knex = Knex( {
    client: 'pg',
    connection: environment.db.connection,
    debug: environment.db.debug
  } );

  this.bookshelf = Bookshelf( this.knex );
  this.bookshelf.plugin( 'registry' );
  this.bookshelf.plugin( 'virtuals' );
  this.bookshelf.plugin( 'visibility' );

  this.foreignKeyStatements = [];

  return this;
};

Db.prototype = {

  /**
   * Setup the database for app startup by checking the schema version and creating
   * the databases or migrating up to the correct schema
   */
  setupDatabase: function setupDatabase( schema, migrations ) {
    return this.getSchemaVersion()
      .then( function( result ) {
        var schemaVersion = result.value,
            latestSchemaVersion = schema.version;

        if ( schemaVersion < 1 ) {
          // Create the database if the schema version is reported as less than 1
          logger.info( 'Creating tables' );
          return this.createTables( schema );

        } else if ( schemaVersion < latestSchemaVersion ) {
          // Start migrating the database if it's version is less than the code schema version
          logger.info( 'Migrating tables' );
          return this.migrateDatabase( migrations, schemaVersion, latestSchemaVersion )

        } else if ( schemaVersion > latestSchemaVersion ) {

          // Return an error if the database version is higher than the code schema version
          return Promise.reject( 'Current database schema version is greater than the code schema version' );
        } else {

          // If the versions are the same we have nothing to do!
          logger.info( 'Nothing needed' );
          return Promise.resolve();
        }
      }.bind( this ) )
        .bind( this )
  },

  /**
   * Run the migrations needed to upgrade from currentSchemaVersion to latestSchemaVersion. For
   * example to upgrade from 2 to 5, it would run migration scripts 3, 4 and 5
   */
  migrateDatabase: function migrateDatabase( migrations, currentSchemaVersion, latestSchemaVersion ) {
    return this.knex.transaction( function( trx ) {

      var migrationNumbers = _.range( currentSchemaVersion, latestSchemaVersion)
        .map( function( migration ) {
          return migration + 1;
        } );

      return Promise.each( migrationNumbers, function( migrationNumber ) {
        return migrations[ migrationNumber ]( trx );
      }.bind( this ) )
        .then( function() {
          // Update the database schema to match after these migrations
          return this.createSchemaVersionRecord( trx, latestSchemaVersion );
        }.bind( this ) );;
    }.bind( this ) );
  },

  /**
   * Create a table
   */
  createTable: function createTable( tableName, tableSchema, records, transaction ) {
    return transaction.schema.createTable( tableName, function ( table ) {

      // Create columns
      table = this.createColumns( table, tableName, tableSchema );

      // Add primary key(s)
      table = this.addPrimaryKeys( table, tableSchema );

    }.bind( this ) )
      .then( function() {
        if ( records ) {
          return transaction.insert( records ).into( tableName );
        } else {
          return Promise.resolve();
        }
      } );
  },

  /**
   * Create a table
   */
  updateTable: function updateTable( tableName, tableSchema, records, transaction ) {
    return transaction.schema.table( tableName, function ( table ) {

      // Create columns
      table = this.createColumns( table, tableName, tableSchema );

      // Add primary key(s)
      table = this.addPrimaryKeys( table, tableSchema );

    }.bind( this ) )
      .then( function() {
        if ( records ) {
          return Promise.each( records, function( record ) {
            return transaction.update( record.values ).into( tableName).where( record.where );
          }.bind( this ) );
        } else {
          return Promise.resolve();
        }
      }.bind( this ) );
  },

  /**
   * Create columns
   */
  createColumns: function createColumns( table, tableName, tableSchema ) {
    var columnNames = _.keys( tableSchema.columns ),
        primaryKeys = getPrimaryKeys( tableSchema );


    _.each( columnNames, function ( columnName ) {
      var columnSchema = tableSchema.columns[ columnName ],
          column;

      // Define column
      if ( columnSchema.type === 'string' && columnSchema.hasOwnProperty( 'maxlength' ) ) {
        column = table[ columnSchema.type ]( columnName, columnSchema.maxlength );
      } else if ( columnSchema.type === 'uuid' ) {
        column = table.uuid( columnName );
      } else if ( columnSchema.type === 'enum' && columnSchema.hasOwnProperty( 'enu' ) && columnSchema.enu.length ) {
        column = table.enu( columnName, columnSchema.enu );
      } else {
        column = table[ columnSchema.type ]( columnName );
      }

      // Set as primary key, if table doesn't use a composite primary key
      if ( _.contains( primaryKeys, columnName ) && primaryKeys.length === 1 ) {
        column.primary();
      }

      // Nullable
      if ( columnSchema.hasOwnProperty( 'nullable' ) && columnSchema.nullable === false ) {
        column.notNullable();
      } else {
        column.nullable();
      }

      // Unique
      if ( columnSchema.hasOwnProperty( 'unique' ) && columnSchema.unique ) {
        column.unique();
      }

      // Unsigned
      if ( columnSchema.hasOwnProperty( 'unsigned' ) && columnSchema.unsigned ) {
        column.unsigned();
      }

      // Timestamp
      if ( columnSchema.hasOwnProperty( 'timestamp' ) && columnSchema.timestamp ) {
        column.timestamp( columnSchema );
      }

      // Foreign key
      if ( columnSchema.hasOwnProperty( 'references' ) ) {
        this.foreignKeyStatements.push ( 'ALTER TABLE "' + tableName + '" ADD CONSTRAINT "' + columnName + '_foreign" FOREIGN KEY ("' + columnName + '") REFERENCES "' + columnSchema.references.table + '" ("' + columnSchema.references.column + '") DEFERRABLE INITIALLY IMMEDIATE' );
      }

      // Default column value
      if ( columnSchema.hasOwnProperty( 'defaultTo' ) ) {
        column.defaultTo( columnSchema.defaultTo );
      }

    }.bind( this ) );

    return table;
  },

  /**
   * Create primary keys on table
   */
  addPrimaryKeys: function addPrimaryKeys( table, tableSchema ) {
    var primaryKeys = getPrimaryKeys( tableSchema );

    // If table has multiple primary keys, set a composite primary key
    if ( primaryKeys.length > 1 ) {
      table.primary( primaryKeys );
    }

    _.each( tableSchema.uniqueComposites, function( uniqueComposite ) {
      if ( uniqueComposite.length > 1 ) {
        table.unique( uniqueComposite );
      }
    } );

    return table;
  },

  /**
   * Create all tables
   */
  createTables: function createTables( schema, seed ) {
    this.foreignKeyStatements = [];

    var sortedTableNames = sortTables( schema.schema ).reverse();

    return this.knex.transaction( function( trx ) {
      return Promise.all( [

        trx.raw( 'SET CONSTRAINTS ALL DEFERRED;' ),

        Promise.map( sortedTableNames, function( tableName ) {
          var tableSchema = schema.schema[ tableName ];
          var records = ( seed ) ? seed[ tableName ] : null;
          return this.createTable( tableName, tableSchema, records, trx );
        }.bind( this ) )
          .then( function() {
            return this.createSchemaVersionRecord( trx, schema.version );
          }.bind( this ) )
            .bind( this )
          .then( function() {
            return this.createForeignKeys( trx )
          }.bind( this ) )
            .bind( this )

      ] );
    }.bind( this ) );
  },

  updateTables: function updateTables( updates, seed ) {
    this.foreignKeyStatements = [];

    return this.knex.transaction( function( trx ) {
      return Promise.all( [

        trx.raw( 'SET CONSTRAINTS ALL DEFERRED;' ),

        Promise.map( _.keys( updates ), function( tableName ) {
          var tableSchema = updates[ tableName ];
          var records = ( seed ) ? seed[ tableName ] : null;
          return this.updateTable( tableName, tableSchema, records, trx );
        }.bind( this ) )
          .then( function() {
            return createSchemaVersionRecord( trx, schema.version );
          } )
          .then( function() {
            return this.createForeignKeys( trx )
          }.bind( this ) )
            .bind( this )

      ] );
    }.bind( this ) );
  },

  /**
   * Create foreign keys in separate function to maintain constraints
   */
  createForeignKeys: function createForeignKeys( trx ) {
    return Promise.all( [

      Promise.map( this.foreignKeyStatements, function( statement ) {
        return trx.raw( statement );
      } )

    ] );
  },

  /**
   * Create a record identifying the schema version of the database
   */
  createSchemaVersionRecord: function createSchemaVersionRecord( trx, schemaVersion ) {
    return trx.where( { key: 'schema_version' } ).delete().from( 'metadata' )
      .then( function() {
        return trx.insert( {
          key: 'schema_version',
          value: schemaVersion
        } ).into( 'metadata' )
      } );
  },

  /**
   * Gets the current version of the database, ruturning 0 if there is an error getting the table
   */
  getSchemaVersion: function createSchemaVersionRecord() {
    return this.knex.select( 'value' ).from( 'metadata' ).where( { key: 'schema_version' } ).limit( 1 )
      .reduce( function( memo, row ) {
        return row;
      } )
      .catch( function( error ) {
        return { value: '0' }
      } );
  },

  /**
   * Drop all tables
   */
  dropTables: function dropTables( schema ) {
    var sortedTableNames = sortTables( schema ).reverse();
    return Promise.each( sortedTableNames, this.knex.schema.dropTableIfExists );
  },

  /**
   * Utility to fetch records from database
   */
  fetch: function fetch( tableName, query, columns ) {

    // Throw error if no table specified
    if ( !tableName ) {
      throw new Error( 'No table specified' );
    }

    // Set defaults
    query = query || {};
    if ( columns ) {
      if ( _.isArray( columns ) ) {
        columns = columns.join();
      }
    } else {
      columns = '*';
    }

    // Run query and return (promise)
    return this.knex.select( columns ).from( tableName ).where( query );
  }

};


// Exports
module.exports = new Db();
