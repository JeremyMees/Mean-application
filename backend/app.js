const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const router = require("./routes/posts");

const postRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");

const app = express();

const databseUrl = `mongodb+srv://jeremy:${process.env.MONGO_ATLAS_PW}@cluster0.qnaij.mongodb.net/node-angular?retryWrites=true&w=majority`;

mongoose
  .connect(databseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.error("Connection failed");
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", express.static(path.join(__dirname, "angular")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT, OPTIONS"
  );
  next();
});

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});

module.exports = app;
