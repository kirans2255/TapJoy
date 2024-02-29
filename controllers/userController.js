const Users = require('../models/User');
// const Product = require('../models/Prod');
// const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const renderSignup = (req, res) => {
    res.render('user/signup', { error: req.query.error || '' });
  };

// Render the home view
const renderHome = (req, res) => {
  res.render('user/login', { error: req.query.error || '' });
};

// Render the dashboard view
const renderDashboard = (req, res) => {
  res.render('user/dashboard');
};

// Render the profile view
const renderProduct = (req, res) => {
  res.render('user/product');
};

const handleSignup = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await Users.findOne({ email });
  
      if (existingUser) {
        return res.redirect('/signup?error=user_exists');
      }
  
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new Users({
        name,
        email,
        password: hashedPassword, // Save the hashed password
      });
  
      await newUser.save();
  
      // Generate JWT token for the new user
      const token = jwt.sign(
        {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '24h',
        }
      );
  
      // Set JWT token in a cookie
      res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry
  
      // Redirect to the dashboard after successful signup
      res.redirect('/');
      console.log('User signed up and logged in: jwt created');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


const handleSignin = async (req, res) => {
  const { email, password } = req.body;
    console.log(req.body);
  try {
    const user = await Users.findOne({ email });
    console.log('user');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

    res.redirect("/");
    console.log("user logged in with email and password : jwt created");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Google OAuth callback handler
const handleGoogleCallback = (req, res) => {
  if (req.isAuthenticated()) {
    req.session.user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
};

// LOGIN WITH GOOGLE
const successGoogleLogin = async (req, res) => {
  try {
    if (!req.user) {
      // If no user data
      return res.status(401).send("no user data , login failed");
    }

    console.log(req.user);

    // Checking user already exists in database
    let user = await Users.findOne({ email: req.user.email });

    if (!user) {
      // If the user does not exist, create a new user
      user = new Users({
        name: req.user.displayName,
        email: req.user.email,
      });

      // Save the new user to the database
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "24h",
      }
    );

    // Set JWT token in a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
    });

    // Redirect the user to the home page
    res.status(200).redirect("/");

    console.log("User logged in with Google : jwt created");
  } catch (error) {
    console.error("Error logging in with Google:", error);
    res.status(500).redirect("/");
  }
};

const failureGooglelogin = (req, res) => {
  res.status(500).send("Error logging in with Google");
};

// FORGOT PASSWORD -- STARTS FROM HERE
// FORGOT PASSWORD PAGE DISPLAY
let forgotGetPage = async (req, res) => {
  try {
    res.render("user/forgot-password");
  } catch (error) {
    res.status(404).send("page not found");
  }
};

////////////////////////////////////////////////
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: "Ticktik@gmail.com",
    to: email,
    subject: "Reset Your Password",
    text: `Your OTP to reset your password is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
////////////////////////////////////////////

// FORGOT EMAIL POST + OTP GENERATION AND MAIL SEND
let forgotEmailPostPage = async (req, res) => {
  const { email } = req.body;
  console.log(email);

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      console.log(user);
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    await sendOtpEmail(email, otp);

    res.render("user/otp", { email });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// RESET PASSWORD
let resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  console.log();
  try {
    const user = await Users.findOne({ email });
    console.log(email);
    console.log(user);

    if (!user) {
      
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || Date.now() > user.otpExpiration) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const bcryptedNewPassword = await bcrypt.hash(newPassword, 10);
    // Reset password
    user.password = bcryptedNewPassword;
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();
    console.log("password resetted");

    res.status(200).redirect("/");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// FORGOT PASSWORD -- ENDS HERE

let blacklistedTokens = [];

const addToBlacklist = (token) => {
  blacklistedTokens.push(token);
};

const isInBlacklist = (token) => {
  return blacklistedTokens.includes(token);
};

// Route handler for handling logout
const handleLogout = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/"); // If no token, redirect to login
  }

  try {
    // Add the JWT to the blacklist (could be a database, cache, etc.)
    await addToBlacklist(token);

    res.clearCookie("jwt"); // Clear the JWT cookie
    res.redirect("/");
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  renderDashboard,
  renderHome,
  renderSignup,
  renderProduct,
  isInBlacklist,
  handleSignup,
  handleSignin,
  handleGoogleCallback,
  forgotGetPage,
  forgotEmailPostPage,
  resetPassword,
  successGoogleLogin,
  failureGooglelogin,
  handleLogout,
};
