module.exports = {
  schema1: {
    version: 1,
    schema: {
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
          last_name:               { type: 'text' }
        }
      }
    }
  },

  schema2: {
    version: 2,
    schema: {
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
          email:                   { type: 'text' }
        }
      }
    }
  },

  schema3: {
    version: 3,
    schema: {
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
          email:                   { type: 'text' },
          hex_color:               { type: 'text' }
        }
      }
    }
  },

  schema4: {
    version: 4,
    schema: {
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
          email:                   { type: 'text' },
          hex_color:               { type: 'text' }
        }
      }
    }
  },

  migrations: {
    2: require( './migrations/2-email' ),
    3: require( './migrations/3-hex-color' )
  }
};
