const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const checkBlocked = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      // No user is logged in, so the page can be shown
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.id;

    const user = await Users.findById(userId);

    if (!user) {
      // This shouldn't happen ideally, but handle it just in case
      return res.status(403).json({ success: false, message: 'Invalid user' });
    }

    // If the user is an admin and is blocked, prevent access to the page
    if (user && user.isBlocked) {
      res.clearCookie("jwt");
      res.redirect("/signin");
    }

    next();
  } catch (error) {
    console.error('Error checking block status:', error);
    return res.status(500).json({ success: false, error: 'Error checking block status' });
  }
};

module.exports = checkBlocked;
