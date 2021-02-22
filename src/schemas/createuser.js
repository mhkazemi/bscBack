module.exports = {

  type: "object",
  properties: {
    name: {
      "type": "string"
    },
    username: {
      "type": "string"
    },
    password: {
      "type": "string"
    },
    role:{
      "type": "string"
    }
  },
  "required": ["name", "username", "password","role"]
}