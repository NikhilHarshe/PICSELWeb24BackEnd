const express = require("express");
const router = express.Router();

const { createEvent, editEvent, getAllEventes, getEventDetails, deleteEvent } = require("../controllers/Event");
const { auth } = require("../controllers/user");


router.post("/createEvent", auth, createEvent);
router.post("/editEvent", auth, editEvent);
router.get("/getAllEventes", getAllEventes);
router.post("/getEventDetails", getEventDetails);
router.delete("/deleteEvent", auth, deleteEvent);

module.exports = router;