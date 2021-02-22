module.exports = {

  type: "object",
  required: ["title", "questions"],
  properties: {
    title: {
      type: "string"
    },
    time: {
      type: "number"
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        required: ["q", "o1", "o2", "o3", "o4", "answer"],
        properties: {
          q: {
            type: "string"
          },
          o1: {
            type: "string"
          },
          o2: {
            type: "string"
          },
          o3: {
            type: "string"
          },
          o4: {
            type: "string"
          },
          answer: {
            type: "integer"
          },
          hint: {
            type: "string"
          }
        }
      }
    }
  }
}