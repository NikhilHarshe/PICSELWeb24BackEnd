const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    eventName:{
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventTime: {
        type: String,
        required: true,
    },
    eventDes:{
        type: String,
        required: true,
    },
    eventLink : {
        type: String,
        required: true,
    },
    eventCreater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    eventManeger: {
        type: String,
    },
    eventLocation : {
        type: String,
    },
    eventImage:{
        type: String,
        // required: true,
    }
});
module.exports = mongoose.model("EventSchema", eventSchema)