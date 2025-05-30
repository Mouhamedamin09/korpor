const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

// For demonstration, we log email sending instead of sending via nodemailer.
const sendEmail = async (email, subject, text) => {
  console.log(`Email sent to ${email}: ${subject} - ${text}`);
};

exports.getRegistrationRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      approvalStatus: "pending",
    });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, surname, email, password, birthdate, role } = req.body;
    if (!name || !surname || !email || !password || !birthdate || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({
      where: { email },
    });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      birthdate,
      role,
      approvalStatus: "approved",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
