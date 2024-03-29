const express = require("express");
const router = express.Router();

const { createMember, getMemberDetails, getAllMembers, deleteMember } = require("../controllers/Member");

router.post("/create_member", createMember);
router.post("/get_member_details", getMemberDetails);
router.post("/getAllMembersDetails", getAllMembers);
router.delete("/deleteMember", deleteMember);

module.exports = router;

