const mongoose = require("mongoose");

const Document = new mongoose.Schema({
    _id: {
        type: String,
    },
    data: {
        type: Object,
    },
    changeLog: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Assuming you have a User model
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            delta: {
                type: Object, // Store the delta of changes made
            },
        },
    ],
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Document", Document);
