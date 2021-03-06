require('../../test-environment.js');

env.dereferenced.nonRefs = {
  "info": {
    "version": "1.0.0",
    "description": "This file contains $ref properties that are not $ref pointers",
    "title": "non-refs"
  },
  "definitions": {
    "$ref": {
      "properties": {
        "id": {
          "type": "number"
        },
        "$ref": {
          "type": "string"
        }
      }
    }
  },
  "swagger": "2.0",
  "paths": {
    "/$ref": {
      "post": {
        "responses": {
          "default": {
            "description": "A $ref to $ref",
            "schema": {
              "properties": {
                "id": {
                  "type": "number"
                },
                "$ref": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  }
};

env.dereferenced.nonRef = {
  "properties": {
    "id": {
      "type": "number"
    },
    "$ref": {
      "type": "string"
    }
  }
};
