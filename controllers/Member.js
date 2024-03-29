const Member = require("../model/Member");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const { uploadImageToCloudinary } = require("../utils/imageUploder");

exports.createMember = async (req, res) => {
    try {
        const { firstName,
            lastName,
            role,
            des,
            linkedinUrl,
            instaUrl,
            twitterUrl,
            accountType,
            email,
            password,
        } = req.body;

        const image = req.files.memberImage

        if (!firstName || !lastName || !role || !des || !image || !accountType || !email || !password) {
            return res.status(401).send(
                {
                    success: false,
                    message: "All Fields are required",
                }
            )
        }

        // console.log("image " ,image);

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

        const memberImage = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
        )

        const createdMember = await Member.create({
            firstName,
            lastName,
            linkedinUrl,
            des,
            accountType,
            twitterUrl,
            instaUrl,
            role,
            image: memberImage.secure_url,
        })

        return res.status(200).json({
            success: true,
            data: createdMember,
            message: "Member Created Successfully",
        })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Member cannot be registered. Please try again.",
        })
    }
}

exports.getMemberDetails = async (req, res) => {
    try {
      const {memberId} = req.body
      const userDetails = await Member.findById(memberId);

    //   console.log(userDetails)
      if(!userDetails) {
        return res.status(401).json({
            success: false,
            message: "Member Data Not found",
            data: userDetails,
          })
      }
      return res.status(200).json({
        success: true,
        message: "Member Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.getAllMembers = async (req, res) => {
    try{
        const {accountType} = req.body;

        const members = await Member.find({accountType : accountType});

        return res.status(200).json({
            success: true,
            data: members,
            message: "Members Fetched Successfully"
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Members data not Fetched"
        })
    }
}

exports.deleteMember = async (req, res) => {
    try {
        const {memberId, email, password } = req.body;

        if (!email || !password || !memberId) {
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

        const member = await Member.findById(memberId);

        if (!member) {
            return res.status(400).json({
                success: false,
                message: "Member Not Found",
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

        await Member.findByIdAndDelete(member._id);

        return res.status(200).json({
            success: true,
            message: "Member Deleted Successfully",
            Member: member,
        })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, Member can not deleted",
            error: error.message,
        })
    }
}