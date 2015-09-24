// External dependencies
var _ = require( 'lodash' ),
    hat = require( 'hat' ),
    Promise = require( 'bluebird' ),
    validator = require( 'validator' ),
    validate = require( 'validate.js' );


// Dependencies
var logger = require( '../lib/logger' ),
    db = require( '../../data' ),
    ResponseError = require( '../lib/response-error' ),
    ValidationError = require( '../lib/validation-error' ),
    schema = require( '../../data/schema' ),
    utils = require( '../lib/utils' );


/**
 * Utility
 * Recursively omit properties with value of null or undefined
 */
var omitNulls = function omitNulls( obj ) {
  return _.transform( obj, function ( result, value, key ) {
    if ( _.isPlainObject( value ) || _.isArray( value ) ) {
      result[ key ] = omitNulls( value );
    } else {
      if ( value !== null && value !== undefined ) {
        result[ key ] = value;
      }
    }
  } );
};


/**
 * BaseModel model
 */
var BaseModel = db.bookshelf.Model.extend( {

  hasTimestamps: [ 'createdDate', 'updatedDate' ],

  hidden: [ 'createdDate', 'updatedDate' ],

  virtuals: {
    _sys: function _sys() {
      return {
        createdDate: utils.formatDateTime( this.get( 'createdDate' ) ),
        updatedDate: utils.formatDateTime( this.get( 'updatedDate' ) )
      };
    }
  },

  /**
   * Constructor override
   */
  constructor: function baseModelConstructor() {
    var instance = db.bookshelf.Model.apply( this, arguments );

    this.setEvents();

    return instance;
  },

  /**
   * Initialize
   */
  initialize: function initialize() {

    //

  },

  /**
   * Set model events
   */
  setEvents: function setEvents() {

    this.on( 'creating', this.onBeforeCreate );
    this.on( 'created', this.onCreate );
    this.on( 'fetching', this.onBeforeRead );
    this.on( 'fetched', this.onRead );
    this.on( 'updating', this.onBeforeUpdate );
    this.on( 'updated', this.onUpdate );
    this.on( 'saving', this.onBeforeSave );
    this.on( 'saved', this.onSave );
    this.on( 'destroying', this.onBeforeDelete );
    this.on( 'destroyed', this.onDelete );

  },

  /**
   * Generate 32-char UUID
   */
  generateId: function generateId( model ) {
    var uuid = hat();

    model.set( 'id', uuid );

    return model;
  },

  /**
   * Validate
   */
  validateModel: function validateModel() {
    var results;

    if ( this.validations ) {

      results = validate( this.attributes, this.validations );

      if ( !_.isEmpty( results ) ) {
        throw new ValidationError( results );
      }

    }

  },

  /**
   * On before create event handler
   */
  onBeforeCreate: function onBeforeCreate( model, attributes, options ) {

    this.generateId( model );
    this.validateModel( model );

    return Promise.resolve();
  },

  /**
   * On create event handler
   */
  onCreate: function onCreate( model, response, options ) {
    return Promise.resolve();
  },

  /**
   * On before read event handler
   */
  onBeforeRead: function onBeforeRead( model, columns, options ) {

    this.validateModel( model );

    return Promise.resolve();
  },

  /**
   * On read event handler
   */
  onRead: function onRead( model, response, options ) {
    return Promise.resolve();
  },

  /**
   * On before update event handler
   */
  onBeforeUpdate: function onBeforeUpdate( model, attributes, options ) {

    this.validateModel( model );

    return Promise.resolve();
  },

  /**
   * On before save event handler
   */
  onBeforeSave: function onBeforeSave( model, attributes, options ) {
    return Promise.resolve();
  },

  /**
   * On save event handler
   */
  onSave: function onSave( model, response, options ) {
    return Promise.resolve();
  },

  /**
   * On update event handler
   */
  onUpdate: function onUpdate( model, response, options ) {
    return Promise.resolve();
  },

  /**
   * On before delete event handler
   */
  onBeforeDelete: function onBeforeRead( model, options ) {
    return Promise.resolve();
  },

  /**
   * On delete event handler
   */
  onDelete: function onDelete( model, response, options ) {
    return Promise.resolve();
  },

  /**
   * Parse data as it comes out of the database
   */
  parse: function baseModelParse( attributes ) {
    return _.reduce( attributes, function( memo, value, key ) {
      var type;

      memo[ _.str.camelize( key ) ] = value;

      return memo;
    }.bind( this ), {} );
  },

  /**
   * Format data as it goes into the database
   */
  format: function baseModelFormat( attributes ) {
    var formatted;

    formatted = _.reduce( attributes, function( memo, value, key ) {
      var snakeCaseKey = _.str.underscored( key ),
          type;

      memo[ snakeCaseKey ] = value;

      return memo;
    }.bind( this ), {} );

    // TODO: this is dirty, figure out a better way
    // If object to save is empty, provide a non-destructive property to avoid error
    if ( _.isEmpty( formatted ) ) {
      formatted.id = this.get( 'id' );
    }

    return formatted;
  },

  /**
   * Format data for response JSON
   */
  toJSON: function baseModelToJSON( options ) {
    var obj = db.bookshelf.Model.prototype.toJSON.call( this, _.defaults( options || {}, {
      omitPivot: true
    } ) );

    _.each( obj, function( value, key ) {
      var snakeCaseKey = _.str.underscored( key ),
          type;

      // Convert dates
      if ( schema[ this.tableName ].columns.hasOwnProperty( snakeCaseKey ) ) {
        type = schema[ this.tableName ].columns[ snakeCaseKey ].type;
        if ( type == 'dateTime' || type == 'date' || type == 'time' ) {
          if ( value !== null ) {
            value = utils.formatDateTime( value );
          }
        }
        if ( type == 'uuid' ) {
          value = utils.formatId( value );
        }
      }

      obj[ key ] = value;

    }.bind( this ) );

    return omitNulls( obj );
  }

} );


/**
 * Find record and create model
 */
BaseModel.find = function baseModelFind( attributes, options ) {
  var model = new this( attributes );

  return model.fetch( _.extend( {}, options, { require: false } ) )
    .tap( function( foundModel ) {
      if ( !foundModel && options.require === true ) {
        throw new ResponseError( 'notFound' );
      }
    } );
};


/**
 * Sanitize data before creating or changing model
 * Omits timestamps and filters out only recognised properties (schema/virtual)
 */
BaseModel.sanitize = function sanitize( attributes ) {
  return _.chain( attributes )
    .omit( [ 'createdDate', 'updatedDate' ] )
    .pick( function( value, key ) {
      return schema[ this.prototype.tableName ].columns.hasOwnProperty( _.str.underscored( key ) )
        || ( this.prototype.hasOwnProperty( 'virtuals' ) && this.prototype.virtuals.hasOwnProperty( key ) );
    }.bind( this ) )
    .value();
};


// Exports
module.exports = BaseModel;
