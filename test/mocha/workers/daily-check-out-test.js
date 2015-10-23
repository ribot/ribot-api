// External dependencies
var _ = require( 'lodash' ),
    moment = require( 'moment' ),
    timekeeper = require( 'timekeeper' );


// Dependencies
var helpers = require( '../helpers' ),
    CheckIn = require( '../../../app/models/check-in' ),
    checkOutWorker = require( '../../../app/workers/daily-check-out' );


describe( 'Daily check out worker', function() {

  describe( 'Handle no check-ins', function() {

    before( function( done ) {
      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          return CheckIn.fetchAll()
            .then( function( checkIns ) {
              return checkIns.invokeThen( 'destroy' );
            } );
        } )
        .then( function() {
          return checkOutWorker.job();
        } )
        .then( function() {
          done();
        } );
    } );

    it( 'should not have added any check-ins', function( done ) {
      helpers.db.fetch( 'check_in' )
        .then( function( results ) {
          results.length.should.eql( 0 );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );

  } );

  describe( 'Handle check-ins which are checked out', function() {

    before( function( done ) {
      this.checkOutDates = {};

      // Set up db tables and seed
      helpers.db.setupForTests()
        .then( function() {
          return CheckIn.fetchAll()
            .then( function( checkIns ) {
              return Promise.all( checkIns.map( function( checkIn ) {
                return checkIn.checkOut();
              } ) );
            } );
        } )
        .then( function() {
          return CheckIn.fetchAll()
            .then( function( checkIns ) {
              checkIns.each( function( checkIn ) {
                this.checkOutDates[ checkIn.get( 'id' ) ] = moment( checkIn.get( 'checkedOutDate' ) ).unix();
              }.bind( this ) );
            }.bind( this ) );
        }.bind( this ) )
        .then( function() {
          return checkOutWorker.job();
        } )
        .then( function() {
          done();
        } );
    } );

    it( 'should not have modified any checked out dates', function( done ) {
      helpers.db.fetch( 'check_in' )
        .then( function( results ) {
          _.each( results, function( checkIn ) {
            moment( checkIn.checked_out_date ).unix().should.equal( this.checkOutDates[ checkIn.id ] );
          }.bind( this ) );
          done();
        }.bind( this ) )
        .catch( function( error ) {
          done( error );
        } );
    } );

  } );

  describe( 'Handle check-ins which are not checked out', function() {

    before( function( done ) {
      helpers.db.setupForTests()
        .then( function() {
          return checkOutWorker.job();
        } )
        .then( function() {
          done();
        } );
    } );

    it( 'should have checked out all check-ins', function( done ) {
      helpers.db.fetch( 'check_in' )
        .then( function( results ) {
          _.each( results, function( checkIn ) {
            checkIn.checked_out_date.should.not.be.null();
          } );
          done();
        } )
        .catch( function( error ) {
          done( error );
        } );
    } );

  } );

} );
