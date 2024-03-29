const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    token: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    image : {
        type: String
    },
    eventsCreated: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EventSchema"
        }
    ],
});

module.exports = mongoose.model("user", userSchema);