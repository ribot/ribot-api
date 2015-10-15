/**
 * Loads the migration scripts. The property name of the export should be the schema version number it upgrades to
 *
 * For example:
 *  module.exports = {
 *    2: require( './2-add-favourite-sweet-column' ),
 *    3: require( './3-add-location-tables' )
 *  };
 */
module.exports = {
  2: require( './2-add-check-in-table' ),
  3: require( './3-add-venue-table' ),
  4: require( './4-add-checkin-venueid-foreign-key' ),
  5: require( './5-add-beacon-checkin-tables' )
};
