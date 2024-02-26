const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = {
  handleGoogleCallback: [authMiddleware.isAuthenticated, handleGoogleCallback],
};
