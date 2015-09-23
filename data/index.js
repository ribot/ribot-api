// External dependencies
var _ = require( 'lodash' ),
    Promise = require( 'bluebird' ),
    Knex = require( 'knex' ),
    Bookshelf = require( 'bookshelf' ),
    dependencyGraph = require( 'dependency-graph' );


// Dependencies
var environment = require( '../app/lib/environment' );


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

    var sortedTableNames = sortTables( schema ).reverse();

    return this.knex.transaction( function( trx ) {
      return Promise.all( [

        trx.raw( 'SET CONSTRAINTS ALL DEFERRED;' ),

        Promise.map( sortedTableNames, function( tableName ) {
          var tableSchema = schema[ tableName ];
          var records = ( seed ) ? seed[ tableName ] : null;
          return this.createTable( tableName, tableSchema, records, trx );
        }.bind( this ) )

      ] );
    }.bind( this ) )
      .bind( this )
      .then( this.createForeignKeys );
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

      ] );
    }.bind( this ) )
      .bind( this )
      .then( this.createForeignKeys );
  },

  /**
   * Create foreign keys in separate function to maintain constraints
   */
  createForeignKeys: function createForeignKeys() {
    return this.knex.transaction( function( trx ) {
      return Promise.all( [

        trx.raw( 'SET CONSTRAINTS ALL DEFERRED;' ),

        Promise.map( this.foreignKeyStatements, function( statement ) {
          return trx.raw( statement );
        } )

      ] );
    }.bind( this ) )
      .bind( this );
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
