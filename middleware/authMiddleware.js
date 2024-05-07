// Middleware to check if the user is authenticated before accessing protected routes
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated) {
      // console.log(isAuthenticated);
      res.header('Cache-Control', 'no-store, private, no-cache, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      return next();
    } else {
      res.redirect('/');
    }
  };
  
  module.exports = {
    isAuthenticated,
  };
  