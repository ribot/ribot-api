FORMAT: 1A

# ribot API Documentation
**Last updated:** {{lastModifiedDate}}

This is the API documentation for the *ribot API*. This API allows you to access information about each ribot, as well as perform actions on your own profile such as update your location, status and availability. It will also allow access to health information such as water consumption.

This document lists the requests and responses possible, along with example payloads. The payloads are formatted in JSON, and each example includes a data schema in the [JSON schema](http://json-schema.org/) format.

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
                  "dateOfBirth": "1946-06-20T15:00:00+00:00",
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
                          "description": "The ribot's date of birth. ISO-8601 with no time component.",
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
