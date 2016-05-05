var version = 7;

var schema = {

  metadata: {
    primary: 'key',
    columns: {
      key:                     { type: 'string', unique: true },
      value:                   { type: 'string' }
    }
  },

  ribot: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid' },
      first_name:              { type: 'text' },
      last_name:               { type: 'text' },
      email:                   { type: 'text', unique: true },
      avatar:                  { type: 'text' },
      date_of_birth:           { type: 'date' },
      hex_color:               { type: 'text' },
      bio:                     { type: 'text' },
      is_authenticated:        { type: 'boolean', nullable: false },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  provider_credential: {
    primary: 'id',
    uniqueComposites: [ [ 'ribot_id', 'provider' ] ],
    columns: {
      id:                      { type: 'uuid' },
      ribot_id:                { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
      provider:                { type: 'text', nullable: false },
      access_token:            { type: 'text' },
      refresh_token:           { type: 'text' },
      expiry_date:             { type: 'dateTime' },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  access_token: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid' },
      ribot_id:                { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
      token:                   { type: 'text', nullable: false, unique: true },
      last_used_date:          { type: 'dateTime', nullable: false },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  check_in: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid' },
      ribot_id:                { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
      venue_id:                { type: 'uuid', references: { table: 'venue', column: 'id' } },
      label:                   { type: 'text' },
      latitude:                { type: 'float' },
      longitude:               { type: 'float' },
      checked_out_date:        { type: 'dateTime' },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  venue: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid' },
      label:                   { type: 'text', nullable: false },
      latitude:                { type: 'float' },
      longitude:               { type: 'float' },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  zone: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      label:                   { type: 'text', nullable: false },
      venue_id:                { type: 'uuid', nullable: false, references: { table: 'venue', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  beacon: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      uuid:                    { type: 'uuid', nullable: false },
      major:                   { type: 'integer', nullable: false },
      minor:                   { type: 'integer', nullable: false },
      zone_id:                 { type: 'uuid', nullable: false, references: { table: 'zone', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  beacon_encounter: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      beacon_id:               { type: 'uuid', nullable: false, references: { table: 'beacon', column: 'id' } },
      check_in_id:             { type: 'uuid', nullable: false, references: { table: 'check_in', column: 'id' } },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  },

  drink: {
    primary: 'id',
    columns: {
      id:                      { type: 'uuid', nullable: false },
      ribot_id:                { type: 'uuid', nullable: false, references: { table: 'ribot', column: 'id' } },
      type:                    { type: 'text', nullable: false },
      volume:                  { type: 'integer', nullable: false },
      created_date:            { type: 'dateTime', nullable: false },
      updated_date:            { type: 'dateTime', nullable: false }
    }
  }

};

module.exports = {
  version: version,
  schema: schema
};
