FORMAT: 1A

# ribot API Documentation
**Last updated:** {{lastModifiedDate}}

This is the API documentation for the *ribot API*. This API allows you to access information about each ribot, as well as perform actions on your own profile such as update your location, status and availability. It will also allow access to health information such as water consumption.

This document lists the requests and responses possible, along with example payloads. The payloads are formatted in JSON, and each example includes a data schema in the [JSON schema](http://json-schema.org/) format. All dates use the ISO-8601 format.

::: note
## :paw_prints: Using with Paw
It is possible to import this spec directly into [Paw](https://luckymarmot.com/paw) to easily test and explore this API.

1. [Download the API blueprint markdown file](/spec).
2. [Install the API Blueprint Importer extension](https://luckymarmot.com/paw/extensions/APIBlueprintImporter).
3. Open Paw, create a new document and Press *File -> Import*.
4. Select the API blueprint markdown file you downloaded.
5. Enjoy testing nirvana!
:::

::: note
## :exclamation: Errors
Any error response from the API uses the appropriate HTTP status code. It also includes:

* A `code` which can be used to identify the error type
* A `message` that will be give the developer a clear idea of what the error message is
* An array of `errors` which describes the data validation errors when the `code` is `invalidData`

### Example
    {
      "code": "invalidData",
      "message": "Invalid request data.",
      "statusCode": 400,
      "errors": [
        {
          "property": "name",
          "messages": [
            "'name' must be longer than 3 characters",
            "'name' must be shorter than 36 characters"
          ]
        }
      ]
    }

### Schema
    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "title": "Error",
      "type": "object",
      "required": [
        "code",
        "message",
        "statusCode",
        "errors"
      ],
      "properties": {
        "code": {
          "description": "Error code reference.",
          "type": "string"
        },
        "message": {
          "description": "Error description",
          "type": "string"
        },
        "statusCode": {
          "description": "HTTP status code.",
          "type": "number"
        },
        "errors": {
          "description": "Errors related to request data.",
          "type": "array",
          "items": {
            "description": "Error related to request data.",
            "type": "object",
            "required": [
              "property",
              "messages"
            ],
            "properties": {
              "property": {
                "description": "Property name.",
                "type": "string"
              },
              "messages": {
                "description": "Error messages relating to a property.",
                "type": [ "array" ],
                "items": {
                  "description": "Error message relating to a property.",
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
:::

# Group Auth
Authentication operations.

## Sign-in [/auth/sign-in]

### Sign-in [POST]
Exchanges credentials for an access token. If the Google account is valid but the account does not have a ribot profile setup, an error will be returned.

+ Request (application/json)

    + Body

            {
              "googleAuthorizationCode": "abc"
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "title": "/auth/sign-in POST request",
              "type": "object",
              "required": [
                "googleAuthorizationCode"
              ],
              "properties": {
                "googleAuthorizationCode": {
                  "description": "One-time authorization code returned from Google's oAuth2 flow.",
                  "type": "string"
                },
                "googleRedirectUri": {
                  "description": "An optional redirect URI initially used to request the googleAuthorizationCode. Will default to a value appropriate for logging in from a mobile SDK if none is provided. Use 'https://developers.google.com/oauthplayground' if the authorization code was received through the Google oAuth Playground. See https://developers.google.com/accounts/docs/OAuth2InstalledApp#choosingredirecturi for more information.",
                  "type": "string"
                }
              }
            }

+ Response 200 (application/json)

    + Body

            {
              "accessToken": "defghijklmnopqrst",
              "ribot": {
                "profile": {
                  "name": {
                    "first": "Lionel",
                    "last": "Rich-Tea"
                  },
                  "email": "lionel@ribot.co.uk",
                  "hexColor": "#C0FFEE",
                  "avatar": "http://stuff.co.uk/images/lionel-richtea.jpg",
                  "dateOfBirth": "1946-06-20",
                  "bio": "Say some stuff..."
                }
              }
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "title": "/auth/register POST response",
              "type": "object",
              "required": [
                "accessToken",
                "ribot"
              ],
              "properties": {
                "accessToken": {
                  "description": "Access token used for authorizing future requests to the Family Time API.",
                  "type": "string"
                },
                "ribot": {
                  "description": "Object describing the logged in ribot",
                  "type": "object",
                  "required": [
                    "profile"
                  ],
                  "properties": {
                    "profile": {
                      "description": "Object containing the profile of a ribot. This information is mostly static.",
                      "type": "object",
                      "required": [
                        "name",
                        "email",
                        "hexColor",
                        "avatar",
                        "dateOfBirth"
                      ],
                      "properties": {
                        "name": {
                          "descrption": "The ribot's name.",
                          "type": "object",
                          "required": [
                            "first",
                            "last"
                          ],
                          "properties": {
                            "first": {
                              "description": "The ribot's first name",
                              "type": "string"
                            },
                            "last": {
                              "description": "The ribot's last name",
                              "type": "string"
                            }
                          }
                        },
                        "email": {
                          "description": "The ribot's email address.",
                          "type": "string"
                        },
                        "hexColor": {
                          "description": "The ribot's hex colour.",
                          "type": "string"
                        },
                        "avatar": {
                          "description": "The ribot's avatar as a URL.",
                          "type": "string"
                        },
                        "dateOfBirth": {
                          "description": "The ribot's date of birth. No time component.",
                          "type": "string"
                        },
                        "bio": {
                          "description": "A short biography of the ribot.",
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }

+ Response 400 (application/json)

    + Body

            {
              "code": "invalidGoogleCode",
              "message": "The user\'s Google authorization code is not valid.",
              "statusCode": 400,
              "errors": []
            }

+ Response 403 (application/json)

    + Body

            {
              "code": "noProfile",
              "message": "Google Auth was successful, but the user does not have a ribot profile set up.",
              "statusCode": 403,
              "errors": []
            }

+ Response 500 (application/json)

    + Body

            {
              "code": "google",
              "message": "Could not communicate with Google.",
              "statusCode": 500,
              "errors": []
            }

# Group ribots

## ribot [/ribots/{ribotId}]

+ Model

    + Body

            {
              "profile": {
                "name": {
                  "first": "Lionel",
                  "last": "Rich-Tea"
                },
                "email": "lionel@ribot.co.uk",
                "hexColor": "#C0FFEE",
                "avatar": "http://stuff.co.uk/images/lionel-richtea.jpg",
                "dateOfBirth": "1946-06-20",
                "bio": "Say some stuff..."
              },
              "checkIns": [
                {
                  "id": "98ba31e55818861b4870553a008ce16d",
                  "label": "Home",
                  "checkedInDate": "2015-10-05T14:48:00.000Z",
                  "isCheckedOut": false,
                  "beaconEncounters": [
                    {
                      "id": "123",
                      "encounterDate": "2015-10-05T14:48:00.000Z",
                      "beacon": {
                        "id": "123",
                        "zone": {
                          "id": "123",
                          "venue": {
                            "id": "123",
                            "label": "ribot studio",
                            "latitude": 50.8313189,
                            "longitude": -0.1471577
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "description": "Object describing the logged in ribot",
              "type": "object",
              "required": [
                "profile"
              ],
              "properties": {
                "profile": {
                  "description": "Object containing the profile of a ribot. This information is mostly static.",
                  "type": "object",
                  "required": [
                    "name",
                    "email",
                    "hexColor",
                    "avatar",
                    "dateOfBirth"
                  ],
                  "properties": {
                    "name": {
                      "descrption": "The ribot's name.",
                      "type": "object",
                      "required": [
                        "first",
                        "last"
                      ],
                      "properties": {
                        "first": {
                          "description": "The ribot's first name",
                          "type": "string"
                        },
                        "last": {
                          "description": "The ribot's last name",
                          "type": "string"
                        }
                      }
                    },
                    "email": {
                      "description": "The ribot's email address.",
                      "type": "string"
                    },
                    "hexColor": {
                      "description": "The ribot's hex colour.",
                      "type": "string"
                    },
                    "avatar": {
                      "description": "The ribot's avatar as a URL.",
                      "type": "string"
                    },
                    "dateOfBirth": {
                      "description": "The ribot's date of birth. No time component.",
                      "type": "string"
                    },
                    "bio": {
                      "description": "A short biography of the ribot.",
                      "type": "string"
                    }
                  }
                },
                "checkIns": {
                  "type": "array",
                  "items": {
                    "title": "Check-in model",
                    "oneOf": [
                      {
                        "type": "object",
                        "required": [
                          "id",
                          "checkedInDate",
                          "isCheckedOut",
                          "label"
                        ],
                        "properties": {
                          "id": {
                            "description": "Check-in ID.",
                            "type": "string"
                          },
                          "label": {
                            "description": "Location name. Only to be used if not attached to a specific venue.",
                            "type": "string"
                          },
                          "latitude": {
                            "description": "Latitude of the check-in. Only to be used if not attached to a specific venue.",
                            "type": "number"
                          },
                          "longitude": {
                            "description": "Longitude of the check-in. Only to be used if not attached to a specific venue.",
                            "type": "number"
                          },
                          "isCheckedOut": {
                            "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                            "type": "boolean"
                          },
                          "checkedInDate": {
                            "description": "Date of check-in.",
                            "type": "string"
                          },
                          "checkedOutDate": {
                            "description": "Date of check-out, if the venue has beacons.",
                            "type": "string"
                          }
                        },
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "required": [
                          "id",
                          "checkedInDate",
                          "isCheckedOut",
                          "venue"
                        ],
                        "properties": {
                          "id": {
                            "description": "Check-in ID.",
                            "type": "string"
                          },
                          "isCheckedOut": {
                            "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                            "type": "boolean"
                          },
                          "checkedInDate": {
                            "description": "Date of check-in.",
                            "type": "string"
                          },
                          "checkedOutDate": {
                            "description": "Date of check-out, if the venue has beacons.",
                            "type": "string"
                          },
                          "venue": {
                            "description": "Venue model.",
                            "type": "object",
                            "required": [
                              "id",
                              "label"
                            ],
                            "properties": {
                              "id": {
                                "description": "Venue ID.",
                                "type": "string"
                              },
                              "label": {
                                "description": "Location label, aim to keep naming consistent for data integrity.",
                                "type": "string",
                                "minLength": 1
                              },
                              "latitude": {
                                "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                "type": "number",
                                "minimum": -90,
                                "maximum": 90
                              },
                              "longitude": {
                                "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                "type": "number",
                                "minimum": -180,
                                "maximum": 180
                              }
                            },
                            "additionalProperties": false
                          },
                          "beaconEncounters": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "required": [
                                "id",
                                "encounterDate",
                                "beacon"
                              ],
                              "properties": {
                                "id": {
                                  "title": "The beacon encounter ID",
                                  "type": "string"
                                },
                                "encounterDate": {
                                  "title": "The date of the encounter",
                                  "type": "string"
                                },
                                "beacon": {
                                  "type": "object",
                                  "required": [
                                    "id",
                                    "zone"
                                  ],
                                  "properties": {
                                    "id": {
                                      "title": "Beacon UUID",
                                      "type": "string"
                                    },
                                    "zone": {
                                      "title": "Zone the beacon belongs to",
                                      "type": "object",
                                      "required": [
                                        "id",
                                        "label",
                                        "venue"
                                      ],
                                      "properties": {
                                        "id": {
                                          "title": "Zone ID",
                                          "type": "string"
                                        },
                                        "label": {
                                          "title": "Name of the zone",
                                          "type": "string"
                                        },
                                        "venue": {
                                          "title": "Venue the zone belongs to",
                                          "type": "object",
                                          "required": [
                                            "id",
                                            "label"
                                          ],
                                          "properties": {
                                            "id": {
                                              "title": "Venue ID",
                                              "type": "string"
                                            },
                                            "label": {
                                              "description": "Location label, aim to keep naming consistent for data integrity.",
                                              "type": "string",
                                              "minLength": 1
                                            },
                                            "latitude": {
                                              "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                              "type": "number",
                                              "minimum": -90,
                                              "maximum": 90
                                            },
                                            "longitude": {
                                              "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                              "type": "number",
                                              "minimum": -180,
                                              "maximum": 180
                                            }
                                          },
                                          "dependencies": {
                                            "latitude": [ "longitude" ],
                                            "longitude": [ "latitude" ]
                                          },
                                          "additionalProperties": false
                                        }
                                      },
                                      "additionalProperties": false
                                    }
                                  },
                                  "additionalProperties": false
                                }
                              },
                              "additionalProperties": false
                            }
                          }
                        },
                        "additionalProperties": false
                      }
                    ]
                  }
                }
              }
            }

### Retrieve single ribot [GET /ribots/{ribotId}?embed={embed}]
Returns a specific ribot object.

+ Parameters

    + ribotId (string) ... The ID of the ribot you want the receive information about.
    + embed (optional, string, `checkins`) ... Optionally embed latest check-in's collection *(Note: Must also provide an access token to receive the checkin information)*.

+ Response 200 (application/json)

    [ribot][]

## Authenticated ribot [/ribots/me]

### Retrieve authenticated ribot [GET /ribots/me?embed={embed}]
Returns the ribot object for the authenticated user.

+ Parameters

    + embed (optional, string, `checkins`) ... Optionally embed latest check-in's collection.

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    [ribot][]

## Collection of ribots [/ribots]

## Retrieve ribot collection [GET /ribots?embed={embed}]
Returns a collection of all ribots.

+ Parameters

    + embed (optional, string, `checkins`) ... Optionally embed latest check-in's collection *(Note: Must also provide an access token to receive the checkin information)*.

+ Response 200 (application/json)

    + Body

            [
              {
                "profile": {
                  "name": {
                    "first": "Lionel",
                    "last": "Rich-Tea"
                  },
                  "email": "lionel@ribot.co.uk",
                  "hexColor": "#C0FFEE",
                  "avatar": "http://stuff.co.uk/images/lionel-richtea.jpg",
                  "dateOfBirth": "1946-06-20",
                  "bio": "Say some stuff..."
                },
                "checkIns": [
                  {
                    "id": "98ba31e55818861b4870553a008ce16d",
                    "label": "Home",
                    "checkedInDate": "2015-10-05T14:48:00.000Z",
                    "isCheckedOut": false
                  }
                ]
              },
              {
                "profile": {
                  "name": {
                    "first": "Lionel",
                    "last": "Rich-Tea"
                  },
                  "email": "lionel@ribot.co.uk",
                  "hexColor": "#C0FFEE",
                  "avatar": "http://stuff.co.uk/images/lionel-richtea.jpg",
                  "dateOfBirth": "1946-06-20",
                  "bio": "Say some stuff..."
                },
                "checkIns": [
                  {
                    "id": "98ba31e55818861b4870553a008ce16d",
                    "checkedInDate": "2015-10-05T14:48:00.000Z",
                    "venue": {
                      "id": "78ga31e55818861b4870553a008ce16d"
                      "label": "ribot studio",
                      "latitude": 50.8313189,
                      "longitude": -0.1471577
                    },
                    "beaconEncounters": [
                      {
                        "id": "123",
                        "encounterDate": "2015-10-05T14:48:00.000Z",
                        "beacon": {
                          "id": "123",
                          "zone": {
                            "id": "123",
                            "venue": {
                              "id": "123",
                              "label": "ribot studio",
                              "latitude": 50.8313189,
                              "longitude": -0.1471577
                            }
                          }
                        },
                      }
                    ]
                    "isCheckedOut": false
                  }
                ]
              }
            ]

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "description": "Array of ribot objects",
              "type": "array",
              "items": {
                "description": "Object describing the logged in ribot",
                "type": "object",
                "required": [
                  "profile"
                ],
                "properties": {
                  "profile": {
                    "description": "Object containing the profile of a ribot. This information is mostly static.",
                    "type": "object",
                    "required": [
                      "name",
                      "email",
                      "hexColor",
                      "avatar",
                      "dateOfBirth"
                    ],
                    "properties": {
                      "name": {
                        "descrption": "The ribot's name.",
                        "type": "object",
                        "required": [
                          "first",
                          "last"
                        ],
                        "properties": {
                          "first": {
                            "description": "The ribot's first name",
                            "type": "string"
                          },
                          "last": {
                            "description": "The ribot's last name",
                            "type": "string"
                          }
                        }
                      },
                      "email": {
                        "description": "The ribot's email address.",
                        "type": "string"
                      },
                      "hexColor": {
                        "description": "The ribot's hex colour.",
                        "type": "string"
                      },
                      "avatar": {
                        "description": "The ribot's avatar as a URL.",
                        "type": "string"
                      },
                      "dateOfBirth": {
                        "description": "The ribot's date of birth. No time component.",
                        "type": "string"
                      },
                      "bio": {
                        "description": "A short biography of the ribot.",
                        "type": "string"
                      }
                    }
                  },
                  "checkIns": {
                    "type": "array",
                    "items": {
                      "title": "Check-in model",
                      "oneOf": [
                        {
                          "type": "object",
                          "required": [
                            "id",
                            "checkedInDate",
                            "isCheckedOut",
                            "label"
                          ],
                          "properties": {
                            "id": {
                              "description": "Check-in ID.",
                              "type": "string"
                            },
                            "label": {
                              "description": "Location name. Only to be used if not attached to a specific venue.",
                              "type": "string"
                            },
                            "latitude": {
                              "description": "Latitude of the check-in. Only to be used if not attached to a specific venue.",
                              "type": "number"
                            },
                            "longitude": {
                              "description": "Longitude of the check-in. Only to be used if not attached to a specific venue.",
                              "type": "number"
                            },
                            "isCheckedOut": {
                              "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                              "type": "boolean"
                            },
                            "checkedInDate": {
                              "description": "Date of check-in.",
                              "type": "string"
                            },
                            "checkedOutDate": {
                              "description": "Date of check-out, if the venue has beacons.",
                              "type": "string"
                            }
                          },
                          "additionalProperties": false
                        },
                        {
                          "type": "object",
                          "required": [
                            "id",
                            "checkedInDate",
                            "isCheckedOut",
                            "venue"
                          ],
                          "properties": {
                            "id": {
                              "description": "Check-in ID.",
                              "type": "string"
                            },
                            "isCheckedOut": {
                              "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                              "type": "boolean"
                            },
                            "checkedInDate": {
                              "description": "Date of check-in.",
                              "type": "string"
                            },
                            "checkedOutDate": {
                              "description": "Date of check-out, if the venue has beacons.",
                              "type": "string"
                            },
                            "venue": {
                              "description": "Venue model.",
                              "type": "object",
                              "required": [
                                "id",
                                "label"
                              ],
                              "properties": {
                                "id": {
                                  "description": "Venue ID.",
                                  "type": "string"
                                },
                                "label": {
                                  "description": "Location label, aim to keep naming consistent for data integrity.",
                                  "type": "string",
                                  "minLength": 1
                                },
                                "latitude": {
                                  "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                  "type": "number",
                                  "minimum": -90,
                                  "maximum": 90
                                },
                                "longitude": {
                                  "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                  "type": "number",
                                  "minimum": -180,
                                  "maximum": 180
                                }
                              },
                              "additionalProperties": false
                            },
                            "beaconEncounters": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "required": [
                                  "id",
                                  "encounterDate",
                                  "beacon"
                                ],
                                "properties": {
                                  "id": {
                                    "title": "The beacon encounter ID",
                                    "type": "string"
                                  },
                                  "encounterDate": {
                                    "title": "The date of the encounter",
                                    "type": "string"
                                  },
                                  "beacon": {
                                    "type": "object",
                                    "required": [
                                      "id",
                                      "zone"
                                    ],
                                    "properties": {
                                      "id": {
                                        "title": "Beacon UUID",
                                        "type": "string"
                                      },
                                      "zone": {
                                        "title": "Zone the beacon belongs to",
                                        "type": "object",
                                        "required": [
                                          "id",
                                          "label",
                                          "venue"
                                        ],
                                        "properties": {
                                          "id": {
                                            "title": "Zone ID",
                                            "type": "string"
                                          },
                                          "label": {
                                            "title": "Name of the zone",
                                            "type": "string"
                                          },
                                          "venue": {
                                            "title": "Venue the zone belongs to",
                                            "type": "object",
                                            "required": [
                                              "id",
                                              "label"
                                            ],
                                            "properties": {
                                              "id": {
                                                "title": "Venue ID",
                                                "type": "string"
                                              },
                                              "label": {
                                                "description": "Location label, aim to keep naming consistent for data integrity.",
                                                "type": "string",
                                                "minLength": 1
                                              },
                                              "latitude": {
                                                "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                                "type": "number",
                                                "minimum": -90,
                                                "maximum": 90
                                              },
                                              "longitude": {
                                                "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                                "type": "number",
                                                "minimum": -180,
                                                "maximum": 180
                                              }
                                            },
                                            "dependencies": {
                                              "latitude": [ "longitude" ],
                                              "longitude": [ "latitude" ]
                                            },
                                            "additionalProperties": false
                                          }
                                        },
                                        "additionalProperties": false
                                      }
                                    },
                                    "additionalProperties": false
                                  }
                                },
                                "additionalProperties": false
                              }
                            }
                          },
                          "additionalProperties": false
                        }
                      ]
                    }
                  }
                }
              }
            }

# Group Check-ins
Check-in's come in two forms: manual check-ins or beacon check-ins.

A manual check-in is performed with the `POST /check-ins` endpoint. With this endpoint you have the choice of checking-in with either a venue ID or a label for the location.

To perform a beacon check-in, see the *Beacons* section.

## Check-in [/check-ins]

+ Model

    + Body

            {
              "id": "123",
              "isCheckedOut": false,
              "checkedOutDate": null,
              "venue": {
                "id": "123"
              },
              "ribot": {
                "id": "123"
              },
              "beaconEncounters": [
                {
                  "id": "123",
                  "encounterDate": "2015-10-05T14:48:00.000Z",
                  "beacon": {
                    "id": "123",
                    "zone": {
                      "id": "123",
                      "venue": {
                        "id": "123",
                        "label": "ribot studio",
                        "latitude": 50.8313189,
                        "longitude": -0.1471577
                      }
                    }
                  },
                }
              ]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "title": "Check-in model",
              "oneOf": [
                {
                  "type": "object",
                  "required": [
                    "id",
                    "checkedInDate",
                    "isCheckedOut",
                    "label",
                    "ribot"
                  ],
                  "properties": {
                    "id": {
                      "description": "Check-in ID.",
                      "type": "string"
                    },
                    "label": {
                      "description": "Location name. Only to be used if not attached to a specific venue.",
                      "type": "string"
                    },
                    "latitude": {
                      "description": "Latitude of the check-in. Only to be used if not attached to a specific venue.",
                      "type": "number"
                    },
                    "longitude": {
                      "description": "Longitude of the check-in. Only to be used if not attached to a specific venue.",
                      "type": "number"
                    },
                    "isCheckedOut": {
                      "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                      "type": "boolean"
                    },
                    "checkedInDate": {
                      "description": "Date of check-in.",
                      "type": "string"
                    },
                    "checkedOutDate": {
                      "description": "Date of check-out, if the venue has beacons.",
                      "type": "string"
                    },
                    "ribot": {
                      "description": "Minima ribot model",
                      "type": "object",
                      "required": [
                        "id"
                      ],
                      "properties": {
                        "id": {
                          "description": "The ribot's id.",
                          "type": "string"
                        }
                      }
                    }
                  },
                  "additionalProperties": false
                },
                {
                  "type": "object",
                  "required": [
                    "id",
                    "checkedInDate",
                    "isCheckedOut",
                    "venue",
                    "ribot"
                  ],
                  "properties": {
                    "id": {
                      "description": "Check-in ID.",
                      "type": "string"
                    },
                    "isCheckedOut": {
                      "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                      "type": "boolean"
                    },
                    "checkedInDate": {
                      "description": "Date of check-in.",
                      "type": "string"
                    },
                    "checkedOutDate": {
                      "description": "Date of check-out, if the venue has beacons.",
                      "type": "string"
                    },
                    "ribot": {
                      "description": "Minima ribot model",
                      "type": "object",
                      "required": [
                        "id"
                      ],
                      "properties": {
                        "id": {
                          "description": "The ribot's id.",
                          "type": "string"
                        }
                      }
                    },
                    "venue": {
                      "description": "Venue model.",
                      "type": "object",
                      "required": [
                        "id",
                        "label"
                      ],
                      "properties": {
                        "id": {
                          "description": "Venue ID.",
                          "type": "string"
                        },
                        "label": {
                          "description": "Location label, aim to keep naming consistent for data integrity.",
                          "type": "string",
                          "minLength": 1
                        },
                        "latitude": {
                          "description": "Latitude, if the check-in didn't happen at an existing venue.",
                          "type": "number",
                          "minimum": -90,
                          "maximum": 90
                        },
                        "longitude": {
                          "description": "Longitude, if the check-in didn't happen at an existing venue.",
                          "type": "number",
                          "minimum": -180,
                          "maximum": 180
                        }
                      },
                      "additionalProperties": false
                    },
                    "beaconEncounters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "required": [
                          "id",
                          "encounterDate",
                          "beacon"
                        ],
                        "properties": {
                          "id": {
                            "title": "The beacon encounter ID",
                            "type": "string"
                          },
                          "encounterDate": {
                            "title": "The date of the encounter",
                            "type": "string"
                          },
                          "beacon": {
                            "type": "object",
                            "required": [
                              "id",
                              "zone"
                            ],
                            "properties": {
                              "id": {
                                "title": "Beacon UUID",
                                "type": "string"
                              },
                              "zone": {
                                "title": "Zone the beacon belongs to",
                                "type": "object",
                                "required": [
                                  "id",
                                  "label",
                                  "venue"
                                ],
                                "properties": {
                                  "id": {
                                    "title": "Zone ID",
                                    "type": "string"
                                  },
                                  "label": {
                                    "title": "Name of the zone",
                                    "type": "string"
                                  },
                                  "venue": {
                                    "title": "Venue the zone belongs to",
                                    "type": "object",
                                    "required": [
                                      "id",
                                      "label"
                                    ],
                                    "properties": {
                                      "id": {
                                        "title": "Venue ID",
                                        "type": "string"
                                      },
                                      "label": {
                                        "description": "Location label, aim to keep naming consistent for data integrity.",
                                        "type": "string",
                                        "minLength": 1
                                      },
                                      "latitude": {
                                        "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                        "type": "number",
                                        "minimum": -90,
                                        "maximum": 90
                                      },
                                      "longitude": {
                                        "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                        "type": "number",
                                        "minimum": -180,
                                        "maximum": 180
                                      }
                                    },
                                    "dependencies": {
                                      "latitude": [ "longitude" ],
                                      "longitude": [ "latitude" ]
                                    },
                                    "additionalProperties": false
                                  }
                                },
                                "additionalProperties": false
                              }
                            },
                            "additionalProperties": false
                          }
                        },
                        "additionalProperties": false
                      }
                    }
                  },
                  "additionalProperties": false
                }
              ]
            }

### Perform check-in [POST /check-ins]
Creates a check-in resource.

+ Request (application/json)

    + Headers

            Authorization: Bearer <token>

    + Body

            {
              "label": "Maple Café",
              "latitude": 50.8313189,
              "longitude": -0.1471577,
              "venueId": "123"
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "title": "/check-ins POST request",
              "oneOf": [
                {
                  "type": "object",
                  "required": [
                    "label"
                  ],
                  "properties": {
                    "label": {
                      "description": "Location label, aim to keep naming consistent for data integrity.",
                      "type": "string",
                      "minLength": 1
                    },
                    "latitude": {
                      "description": "Latitude, if the check-in didn't happen at an existing venue.",
                      "type": "number",
                      "minimum": -90,
                      "maximum": 90
                    },
                    "longitude": {
                      "description": "Longitude, if the check-in didn't happen at an existing venue.",
                      "type": "number",
                      "minimum": -180,
                      "maximum": 180
                    }
                  },
                  "dependencies": {
                    "latitude": [ "longitude" ],
                    "longitude": [ "latitude" ]
                  },
                  "additionalProperties": false
                },
                {
                  "type": "object",
                  "required": [
                    "venueId"
                  ],
                  "properties": {
                    "venueId": {
                      "description": "Venue ID.",
                      "type": "string"
                    }
                  },
                  "additionalProperties": false
                }
              ]
            }

+ Response 201 (application/json)

    [Check-in][]

### Retrieve check-in [GET /check-ins/{checkInId}?embed={embed}]
Retrieve a single check-in.

+ Parameters

    + checkInId (required, string, `123`) ... Check-in ID.
    + embed (optional, string, `encounters`) ... Optionally embed a check-in's beacon encounters collection.

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    [Check-in][]

### Retrieve check-in collection [GET /check-ins?ribotId={ribotId}&venueId={venueId}&dateFrom={dateFrom}&dateTo={dateTo}]
Retrieves a collection of check-ins in date order.

+ Parameters

    + ribotId (optional, string, `123`) ... Filter check-ins performed by ribot
    + venueId (optional, string, `123`) ... Filter check-ins performed at the given venue
    + dateFrom (optional, string, `2015-09-20T19:31:36Z`) ... Filter check-ins performed after date
    + dateTo (optional, string, `2015-09-20T19:31:36Z`) ... Filter check-ins performed before provided date

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    + Body

            [
              {
                "id": "123",
                "label": "Maple Café",
                "isPresent": true,
                "dateCheckedOut": null,
                "venue": {
                  "id": "123"
                },
                "ribot": {
                  "id": "123"
                },
                "beaconEncounters": [
                  {
                    "id": "123",
                    "encounterDate": "2015-10-05T14:48:00.000Z",
                    "beacon": {
                      "id": "123",
                      "zone": {
                        "id": "123",
                        "venue": {
                          "id": "123",
                          "label": "ribot studio",
                          "latitude": 50.8313189,
                          "longitude": -0.1471577
                        }
                      }
                    },
                  }
                ]
              }
            ]

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "array",
              "items": {
                "title": "Check-in model",
                "oneOf": [
                  {
                    "type": "object",
                    "required": [
                      "id",
                      "checkedInDate",
                      "isCheckedOut",
                      "label",
                      "ribot"
                    ],
                    "properties": {
                      "id": {
                        "description": "Check-in ID.",
                        "type": "string"
                      },
                      "label": {
                        "description": "Location name. Only to be used if not attached to a specific venue.",
                        "type": "string"
                      },
                      "latitude": {
                        "description": "Latitude of the check-in. Only to be used if not attached to a specific venue.",
                        "type": "number"
                      },
                      "longitude": {
                        "description": "Longitude of the check-in. Only to be used if not attached to a specific venue.",
                        "type": "number"
                      },
                      "isCheckedOut": {
                        "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                        "type": "boolean"
                      },
                      "checkedInDate": {
                        "description": "Date of check-in.",
                        "type": "string"
                      },
                      "checkedOutDate": {
                        "description": "Date of check-out, if the venue has beacons.",
                        "type": "string"
                      },
                      "ribot": {
                        "description": "Minima ribot model",
                        "type": "object",
                        "required": [
                          "id"
                        ],
                        "properties": {
                          "id": {
                            "description": "The ribot's id.",
                            "type": "string"
                          }
                        }
                      }
                    },
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "required": [
                      "id",
                      "checkedInDate",
                      "isCheckedOut",
                      "venue",
                      "ribot"
                    ],
                    "properties": {
                      "id": {
                        "description": "Check-in ID.",
                        "type": "string"
                      },
                      "isCheckedOut": {
                        "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                        "type": "boolean"
                      },
                      "checkedInDate": {
                        "description": "Date of check-in.",
                        "type": "string"
                      },
                      "checkedOutDate": {
                        "description": "Date of check-out, if the venue has beacons.",
                        "type": "string"
                      },
                      "ribot": {
                        "description": "Minima ribot model",
                        "type": "object",
                        "required": [
                          "id"
                        ],
                        "properties": {
                          "id": {
                            "description": "The ribot's id.",
                            "type": "string"
                          }
                        }
                      },
                      "venue": {
                        "description": "Venue model.",
                        "type": "object",
                        "required": [
                          "id",
                          "label"
                        ],
                        "properties": {
                          "id": {
                            "description": "Venue ID.",
                            "type": "string"
                          },
                          "label": {
                            "description": "Location label, aim to keep naming consistent for data integrity.",
                            "type": "string",
                            "minLength": 1
                          },
                          "latitude": {
                            "description": "Latitude, if the check-in didn't happen at an existing venue.",
                            "type": "number",
                            "minimum": -90,
                            "maximum": 90
                          },
                          "longitude": {
                            "description": "Longitude, if the check-in didn't happen at an existing venue.",
                            "type": "number",
                            "minimum": -180,
                            "maximum": 180
                          }
                        },
                        "additionalProperties": false
                      },
                      "beaconEncounters": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "required": [
                            "id",
                            "encounterDate",
                            "beacon"
                          ],
                          "properties": {
                            "id": {
                              "title": "The beacon encounter ID",
                              "type": "string"
                            },
                            "encounterDate": {
                              "title": "The date of the encounter",
                              "type": "string"
                            },
                            "beacon": {
                              "type": "object",
                              "required": [
                                "id",
                                "zone"
                              ],
                              "properties": {
                                "id": {
                                  "title": "Beacon UUID",
                                  "type": "string"
                                },
                                "zone": {
                                  "title": "Zone the beacon belongs to",
                                  "type": "object",
                                  "required": [
                                    "id",
                                    "label",
                                    "venue"
                                  ],
                                  "properties": {
                                    "id": {
                                      "title": "Zone ID",
                                      "type": "string"
                                    },
                                    "label": {
                                      "title": "Name of the zone",
                                      "type": "string"
                                    },
                                    "venue": {
                                      "title": "Venue the zone belongs to",
                                      "type": "object",
                                      "required": [
                                        "id",
                                        "label"
                                      ],
                                      "properties": {
                                        "id": {
                                          "title": "Venue ID",
                                          "type": "string"
                                        },
                                        "label": {
                                          "description": "Location label, aim to keep naming consistent for data integrity.",
                                          "type": "string",
                                          "minLength": 1
                                        },
                                        "latitude": {
                                          "description": "Latitude, if the check-in didn't happen at an existing venue.",
                                          "type": "number",
                                          "minimum": -90,
                                          "maximum": 90
                                        },
                                        "longitude": {
                                          "description": "Longitude, if the check-in didn't happen at an existing venue.",
                                          "type": "number",
                                          "minimum": -180,
                                          "maximum": 180
                                        }
                                      },
                                      "dependencies": {
                                        "latitude": [ "longitude" ],
                                        "longitude": [ "latitude" ]
                                      },
                                      "additionalProperties": false
                                    }
                                  },
                                  "additionalProperties": false
                                }
                              },
                              "additionalProperties": false
                            }
                          },
                          "additionalProperties": false
                        }
                      }
                    },
                    "additionalProperties": false
                  }
                ]
              }
            }

# Group Beacons

You can query the list of beacons to search for with the `GET /beacons` endpoint. This will return all the UUIDs you need to be looking for to perform beacon encounter check-ins.

A beacon encounter check-in is done via the `POST /beacons/{beaconUuid}/encounters` endpoint. This will then either create a new *check-in* for the authenticated user with the venue the beacon is associated with, or reuse the latest check-in if the venue ID matches and the user has not yet checked out.

## Collection of beacons [GET /beacons]

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    + Body

            [
              {
                "id": "123",
                "zone": {
                  "id": "123",
                  "label": "Main",
                  "venue": {
                    "id": "123",
                    "label": "Maple Café"
                  }
                }
              },
              {
                "id": "123",
                "zone": {
                  "id": "123",
                  "label": "Desks",
                  "venue": {
                    "id": "123",
                    "label": "ribot studio",
                    "latitude": 50.8313189,
                    "longitude": -0.1471577
                  }
                }
              },
              {
                "id": "123",
                "zone": {
                  "id": "123",
                  "label": "Vault",
                  "venue": {
                    "id": "123",
                    "label": "ribot studio",
                    "latitude": 50.8313189,
                    "longitude": -0.1471577
                  }
                }
              }
            ]

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "array",
              "items": {
                "type": "object",
                "required": [
                  "id",
                  "zone"
                ],
                "properties": {
                  "id": {
                    "title": "Beacon UUID",
                    "type": "string"
                  },
                  "zone": {
                    "title": "Zone the beacon belongs to",
                    "type": "object",
                    "required": [
                      "id",
                      "label",
                      "venue"
                    ],
                    "properties": {
                      "id": {
                        "title": "Zone ID",
                        "type": "string"
                      },
                      "label": {
                        "title": "Name of the zone",
                        "type": "string"
                      },
                      "venue": {
                        "title": "Venue the zone belongs to",
                        "type": "object",
                        "required": [
                          "id",
                          "label"
                        ],
                        "properties": {
                          "id": {
                            "title": "Venue ID",
                            "type": "string"
                          },
                          "label": {
                            "description": "Location label, aim to keep naming consistent for data integrity.",
                            "type": "string",
                            "minLength": 1
                          },
                          "latitude": {
                            "description": "Latitude, if the check-in didn't happen at an existing venue.",
                            "type": "number",
                            "minimum": -90,
                            "maximum": 90
                          },
                          "longitude": {
                            "description": "Longitude, if the check-in didn't happen at an existing venue.",
                            "type": "number",
                            "minimum": -180,
                            "maximum": 180
                          }
                        },
                        "dependencies": {
                          "latitude": [ "longitude" ],
                          "longitude": [ "latitude" ]
                        },
                        "additionalProperties": false
                      }
                    },
                    "additionalProperties": false
                  }
                },
                "additionalProperties": false
              }
            }

## Single beacon [GET /beacons/{beaconUuid}]

+ Parameters

    + beaconUuid (string) ... The UUID of the beacon

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    + Body

            {
              "id": "123",
              "zone": {
                "id": "123",
                "label": "Desks",
                "venue": {
                  "id": "123",
                  "label": "ribot studio",
                  "latitude": 50.8313189,
                  "longitude": -0.1471577
                }
              }
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "required": [
                "id",
                "zone"
              ],
              "properties": {
                "id": {
                  "title": "Beacon UUID",
                  "type": "string"
                },
                "zone": {
                  "title": "Zone the beacon belongs to",
                  "type": "object",
                  "required": [
                    "id",
                    "label",
                    "venue"
                  ],
                  "properties": {
                    "id": {
                      "title": "Zone ID",
                      "type": "string"
                    },
                    "label": {
                      "title": "Name of the zone",
                      "type": "string"
                    },
                    "venue": {
                      "title": "Venue the zone belongs to",
                      "type": "object",
                      "required": [
                        "id",
                        "label"
                      ],
                      "properties": {
                        "id": {
                          "title": "Venue ID",
                          "type": "string"
                        },
                        "label": {
                          "description": "Location label, aim to keep naming consistent for data integrity.",
                          "type": "string",
                          "minLength": 1
                        },
                        "latitude": {
                          "description": "Latitude, if the check-in didn't happen at an existing venue.",
                          "type": "number",
                          "minimum": -90,
                          "maximum": 90
                        },
                        "longitude": {
                          "description": "Longitude, if the check-in didn't happen at an existing venue.",
                          "type": "number",
                          "minimum": -180,
                          "maximum": 180
                        }
                      },
                      "dependencies": {
                        "latitude": [ "longitude" ],
                        "longitude": [ "latitude" ]
                      },
                      "additionalProperties": false
                    }
                  },
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            }

## Perform beacon encounter check-in [POST /beacons/{beaconUuid}/encounters]

+ Parameters

    + beaconUuid (string) ... The UUID of the beacon that was encountered

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 201 (application/json)

    + Body

            {
              "id": "123",
              "encounterDate": "2015-10-05T14:48:00.000Z",
              "beacon": {
                "id": "123",
                "zone": {
                  "id": "123",
                  "label": "Desks",
                  "venue": {
                    "id": "123",
                    "label": "ribot studio",
                    "latitude": 50.8313189,
                    "longitude": -0.1471577
                  }
                }
              },
              "checkIn": {
                "id": "123",
                "checkedInDate": "",
                "checkedOut": false,
                "ribot": {
                  "id": "123"
                },
                "venue": {
                  "id": "123"
                }
              }
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "required": [
                "id",
                "encounterDate",
                "beacon",
                "checkIn"
              ],
              "properties": {
                "id": {
                  "title": "The beacon encounter ID",
                  "type": "string"
                },
                "encounterDate": {
                  "title": "The date of the encounter",
                  "type": "string"
                },
                "beacon": {
                  "type": "object",
                  "required": [
                    "id",
                    "zone"
                  ],
                  "properties": {
                    "id": {
                      "title": "Beacon UUID",
                      "type": "string"
                    },
                    "zone": {
                      "title": "Zone the beacon belongs to",
                      "type": "object",
                      "required": [
                        "id",
                        "label",
                        "venue"
                      ],
                      "properties": {
                        "id": {
                          "title": "Zone ID",
                          "type": "string"
                        },
                        "label": {
                          "title": "Name of the zone",
                          "type": "string"
                        },
                        "venue": {
                          "title": "Venue the zone belongs to",
                          "type": "object",
                          "required": [
                            "id",
                            "label"
                          ],
                          "properties": {
                            "id": {
                              "title": "Venue ID",
                              "type": "string"
                            },
                            "label": {
                              "description": "Location label, aim to keep naming consistent for data integrity.",
                              "type": "string",
                              "minLength": 1
                            },
                            "latitude": {
                              "description": "Latitude, if the check-in didn't happen at an existing venue.",
                              "type": "number",
                              "minimum": -90,
                              "maximum": 90
                            },
                            "longitude": {
                              "description": "Longitude, if the check-in didn't happen at an existing venue.",
                              "type": "number",
                              "minimum": -180,
                              "maximum": 180
                            }
                          },
                          "dependencies": {
                            "latitude": [ "longitude" ],
                            "longitude": [ "latitude" ]
                          },
                          "additionalProperties": false
                        }
                      },
                      "additionalProperties": false
                    }
                  },
                  "additionalProperties": false
                },
                "checkIn": {
                  "type": "object",
                  "required": [
                    "id",
                    "checkedInDate",
                    "isCheckedOut",
                    "venue",
                    "ribot"
                  ],
                  "properties": {
                    "id": {
                      "description": "Check-in ID.",
                      "type": "string"
                    },
                    "isCheckedOut": {
                      "description": "Explicit flag whether the user has become out of range. Only applicable if the venue has beacons.",
                      "type": "boolean"
                    },
                    "checkedInDate": {
                      "description": "Date of check-in.",
                      "type": "string"
                    },
                    "checkedOutDate": {
                      "description": "Date of check-out, if the venue has beacons.",
                      "type": "string"
                    },
                    "ribot": {
                      "description": "Minima ribot model",
                      "type": "object",
                      "required": [
                        "id"
                      ],
                      "properties": {
                        "id": {
                          "description": "The ribot's id.",
                          "type": "string"
                        }
                      },
                      "additionalProperties": false
                    },
                    "venue": {
                      "description": "Venue model.",
                      "type": "object",
                      "required": [
                        "id"
                      ],
                      "properties": {
                        "id": {
                          "description": "Venue ID.",
                          "type": "string"
                        }
                      },
                      "additionalProperties": false
                    }
                  },
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            }

# Group Venues

## Collection of venues [GET /venues]
Returns an array of venues common venues.

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    + Body

            [
              {
                "id": "123",
                "label": "Maple Café",
                "latitude": 50.8313189,
                "longitude": -0.1471577
              }
            ]

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "array",
              "items": {
                "required": [
                  "id",
                  "label"
                ],
                "properties": {
                  "id": {
                    "description": "Venue ID.",
                    "type": "string"
                  },
                  "label": {
                    "description": "Location label, aim to keep naming consistent for data integrity.",
                    "type": "string",
                    "minLength": 1
                  },
                  "latitude": {
                    "description": "Latitude, if the check-in didn't happen at an existing venue.",
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                  },
                  "longitude": {
                    "description": "Longitude, if the check-in didn't happen at an existing venue.",
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                  }
                },
                "dependencies": {
                  "latitude": [ "longitude" ],
                  "longitude": [ "latitude" ]
                },
                "additionalProperties": false
              }
            }

## Retreive single venues [GET /venues/{venueId}]
Returns a single venue with a given venue ID.

+ Parameters

    + venueId (string, `123`) ... The venue ID to retreive.

+ Request

    + Headers

            Authorization: Bearer <token>

+ Response 200 (application/json)

    + Body

            {
              "id": "123",
              "label": "Maple Café",
              "latitude": 50.8313189,
              "longitude": -0.1471577
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "required": [
                "id",
                "label"
              ],
              "properties": {
                "id": {
                  "description": "Venue ID.",
                  "type": "string"
                },
                "label": {
                  "description": "Location label, aim to keep naming consistent for data integrity.",
                  "type": "string",
                  "minLength": 1
                },
                "latitude": {
                  "description": "Latitude, if the check-in didn't happen at an existing venue.",
                  "type": "number",
                  "minimum": -90,
                  "maximum": 90
                },
                "longitude": {
                  "description": "Longitude, if the check-in didn't happen at an existing venue.",
                  "type": "number",
                  "minimum": -180,
                  "maximum": 180
                }
              },
              "dependencies": {
                "latitude": [ "longitude" ],
                "longitude": [ "latitude" ]
              },
              "additionalProperties": false
            }
