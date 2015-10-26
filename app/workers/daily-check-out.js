// External dependencies
var CronJob = require( 'cron' ).CronJob,
    Promise = require( 'bluebird' );


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
 * The job to check out all users. Gets all "checked in" checkin's from the DB
 * and adds a check-out date to them all
 */
var checkOutJob = function checkOutJob() {
  var checkedInQuery = {
    where: {
      checked_out_date: null
    }
  };
  return CheckIn.query( checkedInQuery )
    .fetchAll()
    .then( function( checkIns ) {
      return db.knex.transaction( function( trx ) {
        var changePromises = checkIns.map( function( checkIn ) {
          return checkIn.checkOut( trx );
        } );

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
