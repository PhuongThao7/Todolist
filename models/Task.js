const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: String,
    isDone: {
        type: Boolean,
        default: false
    },
    doneAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Task", taskSchema);