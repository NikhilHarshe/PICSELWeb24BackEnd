const User = require("../model/User");
const jwt = require("jsonwebtoken")
const Event = require("../model/event")
const bcrypt = require('bcrypt');
require("dotenv").config()


exports.auth = async(req, res, next) => {
    try{
        //extract token
        console.log("req.cookies.token ", req.cookies.token);
        const token =  req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

        //if token missing, then return responce
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            })
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch (err)
        {
            //verification - issue
            return res.status(404).json({
                success : false,
                message: 'Token is invalid',
            });
        }
        next();
    }
    catch(error) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
} 

exports.signup = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. Pleace try again",
            })
        }

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please Sing in to continue.",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success: true,
            user,
            message: "User registered Successfully ",
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "User cannot be registered. Please try again.",
        })
    }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
    try {
      // Get email and password from request body
      const { email, password } = req.body
  
      // Check if email or password is missing
      if (!email || !password) {
        // Return 400 Bad Request status code with error message
        return res.status(400).json({
          success: false,
          message: `Please Fill up All the Required Fields`,
        })
      }
  
      // Find user with provided email
      const user = await User.findOne({ email }).populate("eventsCreated")
      .exec();
  
      // If user not found with provided email
      if (!user) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        })
      }
  
      // Generate JWT token and Compare Password
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { email: user.email, id: user._id},
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        )
  
        // Save token to user document in database
        user.token = token
        user.password = undefined
        // Set cookie for token and return success response
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
          }
          res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: `User Login Success`,
          })
      } else {
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        })
      }
    } catch (error) {
      console.error(error)
      // Return 500 Internal Server Error status code with error message
      return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
      })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("eventsCreated")
        .exec()
    //   console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fileds are Requried",
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found",
            })
        }

        // Compare Password
        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(403).json({
                success: false,
                message: "Enter Valid Password",
            })
        }

        const eventsCreated = user.eventsCreated
        for (const eventId of eventsCreated) {
            await Event.findByIdAndDelete(eventId)
        }

        await User.findByIdAndDelete(user._id);

        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
            User: user
        })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, User can not deleted",
            error: error.message,
        })
    }
}