const User = require('../models/userDataModel');
// const preventBackAfterLoginMiddleware = require('../middleware/preventBackAfterLoginMiddleware');
// const authController = require('../controllers/authController');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Render the signup view
const renderSignup = (req, res) => {
  res.render('signup');
};

// Render the home view
const renderHome = (req, res) => {
  res.render('signin', { error: req.query.error || '' });
};

// Render the dashboard view
const renderDashboard = (req, res) => {
  res.render('dashboard');
};

// Render the profile view
const renderProduct = (req, res) => {
  res.render('product');
};


// Route handler for handling the signin form submission
const handleSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/?error=authentication_failed');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.redirect('/dash');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
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
    res.redirect('/dash');
  } else {
    res.redirect('/');
  }
};

// Route handler for handling the signup form submission
const handleSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect('/signup?error=user_exists');
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Save the hashed password
    });

    await newUser.save();

    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    // Redirect to the dashboard after successful signup
    res.redirect('/dash');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// FORGOT PASSWORD -- STARTS FROM HERE
// FORGOT PASSWORD PAGE DISPLAY
let forgotGetPage = async (req, res) => {
  try {
    res.render("forgot-password");
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
    const user = await User.findOne({ email });

    if (!user) {
      console.log(user);
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    await sendOtpEmail(email, otp);

    res.render("otp", { email });
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
    const user = await User.findOne({ email });
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

// Route handler for handling logout
const handleLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.redirect('/');
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  renderSignup,
  renderDashboard,
  renderHome,
  renderProduct,
  handleSignin,
  handleGoogleCallback,
  handleSignup,
  forgotGetPage,
  forgotEmailPostPage,
  resetPassword,
  handleLogout,
};
