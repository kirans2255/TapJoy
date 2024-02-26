// Middleware to check if the user is authenticated before accessing protected routes
const jwt = require('jsonwebtoken')
const requireAuth = async (req, res, next) => {
  
  const { authorization } = req.headers

    if (!authorization) {
      return res.status(401).json({error: 'Authorization token required'})
    } 
  
  const token = authorization.split(' ')[1]
  try{
    const {_id} = jwt.verify(token,process.env.SECRET)

    req.user = await User.findOne({_id}).select('_id')
    next();

  }catch(error){
    console.log(error);
    res.status(401).json({error:'Request is not authorised'})
  }
}
module.exports = requireAuth

// const requireAuth = (req, res, next) => {
//   if (req.session.user) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     return next();
//   } else {
//     return next();
//   }
// };

// module.exports = {
//   requireAuth,
// };
