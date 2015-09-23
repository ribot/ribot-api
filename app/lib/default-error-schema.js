var defaultErrorSchema = {
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
};


module.exports = defaultErrorSchema;
