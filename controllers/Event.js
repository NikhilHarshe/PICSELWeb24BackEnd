const User = require("../model/User");
const bcrypt = require("bcrypt");
const Event = require("../model/event");
const { uploadImageToCloudinary } = require("../utils/imageUploder");

exports.createEvent = async (req, res) => {
    try {
        const {
            eventName,
            eventDate,
            eventTime,
            eventDes,
            eventLink,
            eventManeger,
            eventLocation,
            // email,
            // password,
        } = req.body;

        const id = req.user.id

        console.log("req.files", req.body);
        // console.log("req.files", req.files.eventImage);
        // Get poster/ image from request files 
        const image = req.files.eventImage
        
        if (!eventName || !eventDate || !eventTime || !eventDes || !eventLink || !eventManeger ) {
            return res.status(410).json({
                success: false,
                message: "All Fields are Mendatory",
            })
        }

        const eventCreater = await User.findById(id);
        // const eventCreater = await User.findOne({ email: email });

        if (!eventCreater) {
            return res.status(411).json({
                success: false,
                message: "User not Present",
            })
        };

        // Compare Password
        // const passCompare = await bcrypt.compare(password, eventCreater.password);
        // if (!passCompare) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Enter Valid Password",
        //     })
        // }

        const eventImage = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
        )
        // console.log("Uploded Image",eventImage);

        const newEvent = await Event.create({
            eventName,
            eventDate,
            eventTime,
            eventDes,
            eventLink,
            eventManeger,
            eventLocation,
            eventCreater: eventCreater._id,
            eventImage: eventImage.secure_url,
        })

        // Add the new event to the User Schema
        await User.findByIdAndUpdate(
            {
                _id: eventCreater._id
            },
            {
                $push: {
                    eventsCreated: newEvent._id
                },
            },
            { new: true }
        )

        res.status(200).json({
            success: true,
            data: newEvent,
            message: "Event Created Successfully",
            
        })

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to Create Event",
            error: error.message,
        })
    }

}

// Edit Event Details
exports.editEvent = async (req, res) => {
    try {
        const { eventId } = req.body
        const id = req.user.id;
        const updates = req.body

        if(!eventId){
            return res.status(400).json(
                {
                    success: false,
                    message: "Event ID required",
                }
            )
        }

        const eventCreater = await User.findById(id);

        if(!eventCreater)
        {
            return res.status(400).json({
                success: false,
                message: "Enter a Valid Details",
            })
        }

        // Compare Password
        // const passCompare = await bcrypt.compare(password, eventCreater.password);
        // if (!passCompare) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Enter Valid Password",
        //     })
        // }

        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found",
            })
        }

        // If image is update 
        if (req.files) {
            console.log("Image Updated")
            const eventImage = req.files.eventImage
            const image = await uploadImageToCloudinary(
                eventImage,
                process.env.FOLDER_NAME
            )
            event.eventImage = image.secure_url
        }

        // update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                event[key] = updates[key];
            }
        }

        await event.save();

        const updatedEvent = await Event.findOne({
            _id: eventId,
        })
            .populate("eventCreater").exec();

        res.json({
            success: true,
            message: "Event updated Successfully",
            data: updatedEvent,
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message,
        })
    }
}

// Get Course List
exports.getAllEventes = async (req, res) => {
    try {
        const allEvents = await Event.find(
            {
                // eventName: true,
                // eventDes: true,
                // eventDate: true,
                // eventImage: true,
                // eventManeger: true,
                // eventCreater: true,
            }
        )
            .populate("eventCreater").exec();

        return res.status(200).json({
            success: true,
            data: allEvents,
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Event Data`,
            error: error.message,
        })
    }
}

// get Event detailse
exports.getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.body
        const data = await Event.findOne({
            _id: eventId,
        })
            .populate("eventCreater").exec();

        if (!data) {
            return res.status(400).json({
                success: false,
                message: `Could not find Event with id: ${eventId}`,
            })
        }
        return res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Can't Fetch Event Data`,
            error: error.message,
        })
    }
}

exports.deleteEvent = async (req, res) => {
    try {
        // console.log("req.body ", req.body);
        const{ eventId } = req.body
        const id = req.user.id;

        if(!eventId){
            return res.status(403).json(
                {
                    success: false,
                    message: "Event Id is required",
                }
            )
        }

        const eventCreater = await User.findById(id);

        if(!eventCreater)
        {
            return res.status(400).json({
                success: false,
                message: "User not registered Details",
            })
        }

        // Find the Event 
        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(400).json({
                success: false,
                message: "Event not found"
            })
        }
        
        // Compare Password
        // const passCompare = await bcrypt.compare(password, eventCreater.password);
        // if (!passCompare) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Enter Valid Password",
        //     })
        // }

        await User.findByIdAndUpdate(eventCreater._id, {
            $pull: {
                eventsCreated : eventId
            },
        })

        await Event.findByIdAndDelete(eventId)

        return res.status(200).json({
            success: true,
            message: "Event Deleted Successfully",
        })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        })
    }
}

// exports.getCreatesEvents = async (req, res) => {
//     try{
//         const CreaterId = req
//     }
// }