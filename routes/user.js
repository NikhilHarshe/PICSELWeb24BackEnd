const express = require("express");
const router = express.Router();
const { signup, deleteUser, login, getAllUserDetails, auth } = require("../controllers/user");

// // Middleware to parse JSON and URL-encoded bodies
// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

// Route for user signup
router.post("/signup", signup);
router.post("/login", login);
router.post("/getUserDetails", auth, getAllUserDetails);
router.delete("/deleteUser",auth, deleteUser);

module.exports = router;
