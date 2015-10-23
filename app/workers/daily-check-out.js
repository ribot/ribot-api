// External dependencies
var CronJob = require( 'cron' ).CronJob,
    Promise = require( 'bluebird' ),
    _ = require( 'lodash' );


// Dependencies
var CheckIn = require( '../models/check-in' ),
    db = require( '../../data' ),
    logger = require( '../lib/logger' );


/**
 * Initialise
 */
var init = function init() {
  new CronJob( '0 0 * * *', checkOutJob, null, true, 'Europe/London' );
};


/**
 *
 */
var checkOutJob = function checkOutJob() {
  return CheckIn.fetchAll()
    .then( function( checkIns ) {
      return db.knex.transaction( function( trx ) {
        var changePromises = checkIns.chain()
          .map( function( checkIn ) {
            if ( !checkIn.isCheckedOut ) {
              return checkIn.checkOut( trx );
            } else {
              return null;
            }
          } )
          .compact()
          .value();

        return Promise.all( changePromises );
      } )
    } )
    .then( function() {
      logger.debug( 'All users checked out' );
    } )
    .catch( function( error ) {
      logger.error( error );
    } );
};


// Initialise
init();


// Exports
module.exports = {
  init: init,
  job: checkOutJob
}
