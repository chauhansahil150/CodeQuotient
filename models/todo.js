const { Schema, model } = require("mongoose");
const todoSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Todo = model("todo", todoSchema);

module.exports = Todo;