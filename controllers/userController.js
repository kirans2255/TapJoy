const Users = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
require('dotenv').config();
const mongoose = require("mongoose")


const renderAccount = async (req, res) => {
  res.render('user/account');
};

const rendershop = async (req, res) => {
  const product = await Product.find({ productCategory: 'Tablet' });
  res.render('user/shop-3', { product });
};

const rendershops = async (req, res) => {
  const product = await Product.find({ productCategory: 'Phone' });
  console.log(product)
  res.render('user/shop-4', { product });
};


const renderbrand = async (req, res) => {
  const brandName = req.params.brandName;
  try {
    const products = await Product.find({ productBrand: brandName, productCategory: 'Tablet' });
    res.render('user/brand', { product: products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const renderbrands = async (req, res) => {
  const brandName = req.params.brandName;
  try {
    const products = await Product.find({ productBrand: brandName, productCategory: 'Phone' });
    res.render('user/brandd', { product: products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


// Render the dashboard view
const renderDashboard = async (req, res) => {
  // const { user } = req;
  const { name, email, password } = req.body
  const user = await Users.findOne({ email });
  const products = await Product.find({ productCategory: 'Tablet' });
  const product = await Product.find({ productCategory: 'Phone' });

  // console.log(user)
  res.render('user/dashboard', { user, products, product });
};

// Render the profile view
const renderProduct = (req, res) => {
  res.render('user/product');
};

// const rendersingleProduct = async (req, res) => {
//   const { id } = req.params; // Extract the product ID from request parameters

//   try {
//     // Fetch the product based on the provided ID
//     const product = await Product.findById(id);

//     if (!product) {
//       // If product is not found, render an error page or handle accordingly
//       return res.status(404).render('error', { message: 'Product not found' });
//     }
//     // console.log(product);
//     // Render the single product page with the fetched product data
//     res.render('user/single-1', { product });

//   } catch (error) {
//     // Handle any errors that occur during the process
//     console.error('Error rendering single product:', error);
//     res.status(500).render('error', { message: 'Internal Server Error' });
//   }
// };

const rendersingleProduct = async (req, res) => {
  const { id } = req.params; // Extract the product ID from request parameters

  try {
    // Fetch the product based on the provided ID
    const product = await Product.findById(id);

    if (!product) {
      // If product is not found, render an error page or handle accordingly
      return res.status(404).render('error', { message: 'Product not found' });
    }

    // Check if there are other products with the same name
    const similarProducts = await Product.find({ productName: product.productName });

    // Use the image of the first similar product found
    if (similarProducts.length > 1) {
      const alternateProduct = similarProducts.find(p => p._id.toString() !== id);
      if (alternateProduct) {
        productImage = alternateProduct.productImage[0];
        productId = alternateProduct._id
         // Assuming image is a property of the product
        // console.log(`Using image from product ${alternateProduct._id} ${alternateProduct.productImage[0]} (${alternateProduct.productName})`);
      }
    }

    // Render the single product page with the fetched product data
    res.render('user/single-1', { product,productImage,productId});

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error rendering single product:', error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};





// const renderwishlist = (req, res) => {
//   res.render('user/wishlist', { error: req.query.error || '' });
// };

const renderwishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const wishlist = user.wishlist;
    // console.log(wishlist);
    res.render('user/wishlist', { wishlist, user });
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ errorMessage: 'Product not found' });
    }

    if (!user.wishlist || !user.wishlist.products) {
      user.wishlist = { products: [] };
    }

    // Check if the product is already in the wishlist based on productId
    const isProductInWishlistIndex = user.wishlist.products.findIndex(item => item.productId.toString() === productId);
    if (isProductInWishlistIndex !== -1) {
      // If product is found in wishlist, remove it
      user.wishlist.products.splice(isProductInWishlistIndex, 1);
      await user.save();
      return res.status(201).json({ errorMessage: 'Removed from Wishlist successfully' });
    }

    // If product not found in wishlist, add it
    user.wishlist.products.push({
      productId: productId,
      productName: product.productName,
      productPrice: product.productPrice,
      productImage: product.productImage,
    });

    await user.save();
    res.status(200).json({ successMessage: 'Added to Wishlist successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
};





// Route handler to remove product from wishlist by productName
const removeFromWishlist = async (req, res) => {
  const { productName } = req.params;
  const userId = req.user.id;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find index of product in wishlist by productName
    const index = user.wishlist.products.findIndex(item => item.productName === productName);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    // Remove product from wishlist
    user.wishlist.products.splice(index, 1);
    await user.save();
    // console.log(user);

    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



//signup
const renderSignup = (req, res) => {
  res.render('user/signup', { error: req.query.error || '' });
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
//signin
const renderHome = async (req, res) => {
  try {
    const user = await Users.find(); // Corrected line
    if (req.cookies.jwt) {
      res.redirect('/');
    } else {
      res.render('user/login', { user }); // Passing user object to render function
    }
  } catch (error) {
    console.error(error);
    // Handle error appropriately, maybe by sending an error response
    res.status(500).send('Internal Server Error');
  }
}

const handleSignin = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    const user = await Users.findOne({ email });
    console.log('user');

    if (!user) {
      const errorMessage = "User not found";
      return res.status(404).render('user/login', { error: errorMessage });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      const errorMessage = "Invalid password";
      return res.status(401).render('user/login', { error: errorMessage });
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

const sort = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase(); // Extract the category parameter and convert to lowercase

    let filteredProducts;

    if (category === 'allproducts' || category === 'sortbypopularity') {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).exec();
    } else if (category === 'alphabeticallyaz') {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).sort({ productName: 1 }).exec();
    } else if (category === 'alphabeticallya') {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).sort({ productName: -1 }).exec();
    } else if (category === 'sortbyhightolow') {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).sort({ productPrice: -1 }).exec();
    } else if (category === 'sortbylowtohigh') {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).sort({ productPrice: 1 }).exec();
    } else {
      filteredProducts = await Product.find({ productCategory: 'Tablet' }).exec();
    }

    res.render('user/shop-3', { category: category, product: filteredProducts });
  } catch (err) {
    // Handle errors
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
};



const Getsort = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase(); // Extract the category parameter and convert to lowercase

    let filteredProducts;

    if (category === 'allproducts' || category === 'sortbypopularity') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).exec();
    } else if (category === 'alphabeticallyaz') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productName: 1 }).exec();
    } else if (category === 'alphabeticallya') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productName: -1 }).exec();
    } else if (category === 'sortbyhightolow') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productPrice: -1 }).exec();
    } else if (category === 'sortbylowtohigh') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productPrice: 1 }).exec();
    } else {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).exec();
    }

    res.render('user/shop-4', { category: category, product: filteredProducts });
  } catch (err) {
    // Handle errors
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Route handler for handling logout
const handleLogout = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/"); // If no token, redirect to login
  }
  try {
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
  handleSignup,
  handleSignin,
  renderAccount,
  rendershop,
  rendershops,
  rendersingleProduct,
  renderwishlist,
  addToWishlist,
  renderbrand,
  renderbrands,
  removeFromWishlist,
  sort,
  Getsort,
  forgotGetPage,
  forgotEmailPostPage,
  resetPassword,
  successGoogleLogin,
  failureGooglelogin,
  handleLogout,
};
