const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');

dotenv.config();

const connectDB = require("./config/db");
const client = require("./config/redis");
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemRoutes");
const submitRouter = require("./routes/submitRoute");
const adminRouter = require('./routes/adminRoutes');
const chatAIRouter = require('./routes/chatAIRoute');


const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({limit: "5mb"}));
app.use(cookieParser());
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/admin", adminRouter);
app.use("/chatAI", chatAIRouter);

app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server."
  });
});

const initializeConnection = async () => {
  try {
    await Promise.all([client.connect(), connectDB()]);
    console.log("Databases are connected successfully");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Server in listening at port : " + PORT);
    });
  } catch (error) {
    console.error("Error in connection: " + error);
  }
};

initializeConnection();

