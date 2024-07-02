require("dotenv").config();

const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const User = require("./models/user");

const api = express();

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "10s" });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// api.use(cors());
api.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);

api.use(express.json());

api.post("/token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({
      name: user.name,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      name: user.name,
      email: user.email,
    });
    res.json({ accessToken, refreshToken });
  });
});

api.post("/signup", (req, res) => {
  console.log("You've reached here");
  console.log(req.body);
  const userPayload = { name: req.body.name, email: req.body.email };
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);
  console.log(accessToken, refreshToken);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    // number: req.body.number,
    // role: req.body.role,
    jwt: accessToken,
    password: req.body.password,
  });
  user
    .save()
    .then((response) => {
      console.log(response);
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.json({ message: "Sign up successful", refreshToken: refreshToken });
      // res.json({  });
      console.log("Line 40 Bal Kishan");
    })
    .catch((e) => {
      console.log(e);
    });
});

api.post("/signin", (req, res) => {
  console.log("You've reached here");
  User.findOne({ email: req.body.email })
    .then((response) => {
      console.log(response);
      // if (response.password !== req.password) {
      //   return res.json({ message: "Invalid User" });
      // }
      const userPayload = { name: response.name, email: response.email };
      const accessToken = generateAccessToken(userPayload);
      const refreshToken = generateRefreshToken(userPayload);
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.json({ message: "Sign up successful", refreshToken: refreshToken });
    })

    .catch((e) => {
      console.log(e);
    });
});

const authenticateJWT = (req, res, next) => {
  console.log("You've reached here");
  const token = req.header("Authorization").replace("Bearer ", "");
  console.log("My Token " + token);

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Bal Kishan" + verified);
    req.user = verified;
    res.json({ message: "Valid token", isValid: true });
    next();
  } catch (error) {
    console.log(error);
    res.json({ message: "Invalid token", isValid: false });
  }
};

api.get("/", authenticateJWT);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    api.listen(8080);
    console.log("Connected");
  })
  .catch((err) => {
    console.log(err);
  });
