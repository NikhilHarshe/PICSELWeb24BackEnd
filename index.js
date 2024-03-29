const express = require("express");

const app = express();

const userRouter = require("./routes/user");
const eventRouter = require("./routes/events");
const memberRouter = require("./routes/member");
const database = require("./config/database");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// setting up port number
const PORT = process.env.PORT || 4000;

//Loading environment variables form .env file
dotenv.config();

// connection to database
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// cloudinaryConnect();
cloudinaryConnect();

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/", eventRouter);
app.use("/api/v1/", memberRouter);

app.get("/", (req, res)=> {
    return res.json({
        success: true,
        message: "Your server is up and running...."
    });
});

app.listen(PORT, ()=> {
    console.log(`server stated on port no ${PORT}`);
})

