const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    isDone: {
        type: Boolean,
        default: false
    },

    doneAt: {
        type: Date
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    // Người tạo task
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Danh sách user được phân task
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Danh sách user đã hoàn thành
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]

});

module.exports = mongoose.model("Task", taskSchema);