const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("./../schema/schema.js");
require("dotenv").config()

const signupController = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = {
      ...req.body,
      password: hashedPassword,
    };

    const user = await User.create(userData);
    const userId = user._id;

    const token = jwt.sign({ userId }, process.env.JWT_SECRET);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred during signup.",
      error: error.message,
    });
  }
};

const signinController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Email not found." });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({
        message: "Login successful.",
        token: token,
        user,
      });
    } else {
      return res.status(400).json({ message: "Incorrect password." });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred during login.",
      error: error.message,
    });
  }
};

module.exports = { signupController, signinController };
