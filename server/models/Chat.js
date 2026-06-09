const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        trim: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    userJoinTimes: {
        type: Map,
        of: Date,
        default: {},
    },
    showHistoryToNewMembers: { // Determines if new members can see chat history
        type: Boolean,
        default: true, // Default to true to match existing behavior
    },
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
