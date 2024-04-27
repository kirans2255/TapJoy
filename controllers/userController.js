const Users = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Admin = require('../models/Admin');
require('dotenv').config();
const mongoose = require("mongoose");
const { log } = require('handlebars');
const razorpay = require("../config/razorpay");

// Render the home view
// const renderHome = (req, res) => {
//   res.render('user/login', { error: req.query.error || '' });
// };


const renderAccount = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses;
    const orders = [];

    // Fetch product details for each order
    for (const order of user.orders) {
      const productId = order.productId;

      const product = await Product.findById(productId);
      if (product) {
        const { productName, productImage } = product;
        let cancellable = true; 
        let statusText = order.status;
        
        if (order.status === 'canceled') {
          cancellable = false;
          statusText = 'Order canceled';
        } else if (order.status === 'Delivered') {
          cancellable = false; 
          statusText = 'Order delivered';
        }

        orders.push({
          _id: order._id,
          userId: user._id, 
          productName,
          productImage: productImage[0], 
          quantity: order.quantity,
          totalprice: order.totalprice,
          created_at: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          status: statusText, 
          cancellable: cancellable 
        });
      }
    }

    res.render('user/account', { user, address, orders });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).render('error', { errorMessage: "Error fetching user data" });
  }
};



const cancelOrder = async (req, res) => {
  try {
      const { orderId, userId } = req.body;

      const user = await Users.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const orderIndex = user.orders.findIndex(order => order._id.toString() === orderId);
      if (orderIndex === -1) {
          return res.status(404).json({ message: "Order not found" });
      }

      user.orders[orderIndex].status = 'canceled';
      await user.save();

      // Redirect back to the account page
      res.redirect('/account');
  } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ error: "Error canceling order" });
  }
};


const rendershop = async (req, res) => {
  const uniqueProductNames = await Product.distinct("productName", { productCategory: 'Tablet' });

  // Query for one product per unique product name
  const uniqueProducts = await Promise.all(
    uniqueProductNames.map(async (productName) => {
      const product = await Product.findOne({ productName });
      return product;
    })
  );
  const brand = await Brand.find();

  // console.log(uniqueProducts);
  res.render('user/shop-3', { product: uniqueProducts, brand });
};


const rendershops = async (req, res) => {
  try {
    // Get unique product names
    const uniqueProductNames = await Product.distinct("productName", { productCategory: 'Phone' });
    // Query for one product per unique product name
    const uniqueProducts = await Promise.all(
      uniqueProductNames.map(async (productName) => {
        const product = await Product.findOne({ productName });
        return product;
      })
    );
    const brand = await Brand.find();
    // console.log(uniqueProducts);
    res.render('user/shop-4', { product: uniqueProducts, brand });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const renderbrand = async (req, res) => {
  const brandName = req.params.brandName;
  try {
    const uniqueProductNames = await Product.distinct("productName", { productCategory: 'Tablet', productBrand: brandName });

    // Query for one product per unique product name
    const uniqueProducts = await Promise.all(
      uniqueProductNames.map(async (productName) => {
        const product = await Product.findOne({ productName });
        return product;
      })
    );
    res.render('user/brand', { product: uniqueProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const renderbrands = async (req, res) => {
  const brandName = req.params.brandName;
  try {
    const uniqueProductNames = await Product.distinct("productName", { productCategory: 'Phone', productBrand: brandName });

    // Query for one product per unique product name
    const uniqueProducts = await Promise.all(
      uniqueProductNames.map(async (productName) => {
        const product = await Product.findOne({ productName });
        return product;
      })
    );
    res.render('user/brand', { product: uniqueProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};




// const renderbrandcategory = async (req, res) => {
//   const category = req.params.category;
//   try {
//      const products = await Product.find({ productCategory: category }); 
//     res.render('user/brand', { product: products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server Error');
//   }
// };

// Render the dashboard view
const renderDashboard = async (req, res) => {
  // const { user } = req;
  const { name, email, password } = req.body
  const user = await Users.findOne({ email });
  const uniqueProductName = await Product.distinct("productName", { productCategory: 'Tablet' });
  const uniqueProductNames = await Product.distinct("productName", { productCategory: 'Phone' });
  const brand = await Brand.find()
  const admin = await Admin.findOne();
  const banner = admin.Banner;
  // console.log(banner);


  const uniqueProducts = await Promise.all(
    uniqueProductNames.map(async (productName) => {
      const product = await Product.findOne({ productName });
      return product;
    })
  );
  const uniqueProduct = await Promise.all(
    uniqueProductName.map(async (productName) => {
      const product = await Product.findOne({ productName });
      return product;
    })
  )
  uniqueProducts.length = 4
  uniqueProduct.length = 4
  // res.render('user/brand', { product: uniqueProducts });
  res.render('user/dashboard', { user, products: uniqueProduct, product: uniqueProducts, brand, banner });
};


// Render the profile view
const renderProduct = (req, res) => {
  res.render('user/product');
};


//Single product page
const rendersingleProduct = async (req, res) => {
  const { id } = req.params; // Extract the product ID from request parameters

  try {
    // Fetch the product based on the provided ID
    const product = await Product.findById(id);

    if (!product) {
      // If product is not found, render an error page or handle accordingly
      return res.status(404).render('error', { message: 'Product not found' });
    }

    // Fetch all products with the same name
    const similarProducts = await Product.find({ productName: product.productName });

    // Render the single product page with the fetched product data
    res.render('user/single-1', { product, similarProducts });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error rendering single product:', error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};



const renderwishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Get product IDs, RAM, and ROM from the wishlist
    const wishlistItems = user.wishlist.products;

    // Fetch product details for each item in the wishlist
    const wishlistProducts = [];
    for (const item of wishlistItems) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });
      // console.log(wishlistItems);

      if (product) {
        // Extract the variant matching the RAM and ROM
        const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);
        // console.log(variant);
        // Push the product details to the wishlistProducts array
        wishlistProducts.push({
          _id: product._id,
          productName: product.productName,
          productImage: product.productImage[0], // Assuming the product image is an array and we take the first image
          productPrice: variant.productPrice,
          productRam: variant.productRam,
          productRom: variant.productRom
        });
        // console.log(wishlistProducts);
      }
    }

    res.render('user/wishlist', { wishlist: wishlistProducts, user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};





const addToWishlist = async (req, res) => {
  const { ram, rom } = req.body;
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

    const productInWishlist = user.wishlist.products.find(
      item =>
        item.productId.toString() === productId &&
        item.productRam === ram &&
        item.productRom === rom
    );

    if (productInWishlist) {
      // If product variant is found in the wishlist, remove it
      user.wishlist.products = user.wishlist.products.filter(
        item =>
          !(item.productId.toString() === productId && item.productRam === ram && item.productRom === rom)
      );
      await user.save();
      return res.status(201).json({ errorMessage: 'Removed from Wishlist successfully' });
    }

    // If product variant not found in wishlist, add it
    user.wishlist.products.push({
      productId: productId,
      productRom: rom,
      productRam: ram
    });

    await user.save();
    res.status(200).json({ successMessage: 'Added to Wishlist successfully', productDetails: product });
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

    res.status(200).json({ errorMessage: 'Removed from Wishlist successfully' });
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

// Google OAuth callback handler
// const handleGoogleCallback = (req, res) => {
//   if (req.isAuthenticated()) {
//     req.session.user = {
//       id: req.user._id,
//       name: req.user.name,
//       email: req.user.email,
//     };
//     res.redirect('/');
//   } else {
//     res.redirect('/login');
//   }
// };

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

//sort filter products

// const Getsort = async (req, res) => {
//   try {
//     const filteredProducts = await Product.find({ productCategory: 'Tablet' }).exec();
//     return res.render('user/shop-3', { product: filteredProducts });
//   } catch (err) {
//     console.error('Error fetching products:', err);
//     res.status(500).send('Internal Server Error');
//   }
// };


const sort = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase(); // Extract the category parameter and convert to lowercase

    let filteredProducts;
    const brand = await Brand.find();


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

    res.render('user/shop-3', { category: category, product: filteredProducts, brand });
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
    const brand = await Brand.find();


    if (category === 'allproducts' || category === 'sortbypopularity') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).exec();
    } else if (category === 'alphabeticallyaz') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productName: 1 }).exec();
    } else if (category === 'alphabeticallya') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ productName: -1 }).exec();
    } else if (category === 'sortbyhightolow') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ "variants.productPrice": -1 }).exec();
    } else if (category === 'sortbylowtohigh') {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).sort({ "variants.productPrice": 1 }).exec();
    } else {
      filteredProducts = await Product.find({ productCategory: 'Phone' }).exec();
    }

    // Retrieve only distinct products based on productName
    filteredProducts = filteredProducts.reduce((unique, item) => {
      return unique.some(i => i.productName === item.productName) ? unique : [...unique, item];
    }, []);

    res.render('user/shop-4', { category: category, product: filteredProducts, brand });
  } catch (err) {
    // Handle errors
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
};


//variant-filter


// FORGOT PASSWORD -- ENDS HERE


//Single product
// const handlesingleProduct = async (req, res) => {
//   const { id } = req.params;
//   console.log(id);
//   try {
//     // Fetch the product based on the provided id
//     const product = await Product.findById(id);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Handle the fetched product, maybe render a view or send it as JSON
//     res.render('user/single-1', { product });
//   } catch (error) {
//     console.error('Error handling single product:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



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


//contact
const renderContact = async (req, res) => {
  try {
    res.render('user/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


const handleContact = (req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // Setup email data with unicode symbols
  const { name, email, message } = req.body;
  let mailOptions = {
    from: email,
    to: process.env.APP_EMAIL,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ', info.messageId);
    // Response to client
    res.send('Message sent successfully!');
  });
};

////////////////// 
//About us

const renderAbout = async (req, res) => {
  try {
    const brand = await Brand.findOne();
    // const banner = admin.Banner;
    res.render('user/about', { brand });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

/////////////////////////////////////////////////////////// 
//Cart


const renderCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    
    if (!user) {
      return res.status(404).send('User not found');
    }


    const cartItems = user.cart.products;

    // Fetch product details for each item in the cart
    const cartProducts = [];
    for (const item of cartItems) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });

      if (product) {
        // Extract the variant matching the RAM and ROM
        const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);

        // Push the product details to the cartProducts array along with quantity
        cartProducts.push({
          _id: product._id,
          variantId: variant._id,
          productName: product.productName,
          productImage: product.productImage[0], // Assuming the product image is an array and we take the first image
          productPrice: variant.productPrice,
          productRam: variant.productRam,
          productRom: variant.productRom,
          quantity: item.quantity,
          subtotal: item.quantity * variant.productPrice
        });
      }
    }

    const cartTotal = cartProducts.reduce((sum, item) => sum + item.subtotal, 0);


    res.render('user/cart', { user, cart: cartProducts, cartTotal });
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
}



const addToCart = async (req, res) => {
  const { ram, rom } = req.body;
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

    if (!user.cart || !user.cart.products) {
      user.cart = { products: [] };
    }

    // Check if the product variant is already in the cart
    const existingProductIndex = user.cart.products.findIndex(item => item.productId.toString() === productId && item.productRam === ram && item.productRom === rom);

    if (existingProductIndex !== -1) {
      // If product variant is found in the cart, increase quantity
      user.cart.products[existingProductIndex].quantity += 1;
    } else {
      // If product variant not found in cart, add it
      user.cart.products.push({
        productId: productId,
        productRam: ram,
        productRom: rom,
        quantity: 1 // Initialize quantity to 1
      });
    }

    await user.save();
    res.status(200).json({ successMessage: 'Added to Cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
};




const updateQuantity = async (req, res) => {
  const { quantity } = req.body;
  const productId = req.body.id;
  const userId = req.user.id;

  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    if (!user.cart || !user.cart.products || user.cart.products.length === 0) {
      return res.status(404).json({ errorMessage: 'Cart is empty' });
    }

    const index = user.cart.products.findIndex(item => item.productId.toString() === productId);

    if (index === -1) {
      return res.status(404).json({ errorMessage: 'Product not found in cart' });
    }

    const cartItems = user.cart.products;
    for (const item of cartItems) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });

      if (product) {
        const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);
        const productPrice = variant.productPrice;

        // Update quantity and subtotal
        user.cart.products[index].quantity = parseInt(quantity);
        const updatedQuantity = parseInt(quantity);
        const subtotal = productPrice * updatedQuantity;
        user.cart.products[index].subtotal = subtotal;

        // console.log(subtotal);

        await user.save();

        return res.status(200).json({ successMessage: 'Quantity updated successfully', subtotal });
      }
    }

    return res.status(404).json({ errorMessage: 'Product not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMessage: 'Internal server error' });
  }
};



// Route handler to remove product from cart by productId
const removeFromCart = async (req, res) => {
  const productId = req.body.id; 
  const userId = req.user.id;
  
  // console.log(productId,userId)

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find index of product in wishlist by productId
    const index = user.cart.products.findIndex(item => item.productId.toString() === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    // Remove product from wishlist
    user.cart.products.splice(index, 1);
    await user.save();

    res.status(200).json({ errorMessage: 'Removed from Wishlist successfully' });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//checkout

const rendercheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const cartItems = user.cart.products;
    const address = user.addresses;

    // Fetch product details for each item in the cart
    const cartProducts = [];
    for (const item of cartItems) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });

      if (product) {
        // Extract the variant matching the RAM and ROM
        const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);

        // Push the product details to the cartProducts array along with quantity
        cartProducts.push({
          _id: product._id,
          productName: product.productName,
          productImage: product.productImage[0], // Assuming the product image is an array and we take the first image
          productPrice: variant.productPrice,
          productRam: variant.productRam,
          productRom: variant.productRom,
          quantity: item.quantity, // Include quantity in the cart product
          subtotal: item.quantity * variant.productPrice
        });
      }
    }

    const cartTotal = cartProducts.reduce((sum, item) => sum + item.subtotal, 0);
    res.render('user/checkout', { user, cart: cartProducts, cartTotal, address });
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
}



const Address = async (req, res) => {
  const userId = req.user.id;
  try {
    const {
      name,
      house_name,
      street,
      city,
      state,
      pin,
      address_type,
      phone,
    } = req.body;
    console.log(req.body);

    let user = await Users.findById(userId);

    const newAddress = ({
      name: name,
      house_name: house_name,
      street: street,
      city: city,
      state: state,
      pin: pin,
      address_type: address_type,
      phone: phone,
    });

    user.addresses.push(newAddress)
    await user.save();
    res.redirect('/checkout');

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Error adding the product' });
  }
}


const Cod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentMethodId, discount, grandTotal  } = req.body;

    // Find the user by ID
    const user = await Users.findById(userId).populate("cart.products");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the selected address in the user's addresses array
    const selectedAddress = user.addresses.find(
      (address) => address._id == addressId
    );

    if (!selectedAddress) {
      return res.status(404).json({ message: "Selected address not found" });
    }

    // Get all products in the cart
    const allProducts = user.cart.products;
    // console.log(allProducts)

    if (allProducts.length === 0) {
      return res
        .status(400)
        .json({ message: "No products in the cart" });
    }

    // Iterate through each product in the cart and create a new order object
    for (const item of allProducts) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Find the variant matching the RAM and ROM
      const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);

      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      const newOrder = {
        // orderId: new mongoose.Types.ObjectId(),
        productId: item.productId,
        productRam:item.productRam,
        productRom:item.productRom,
        quantity: item.quantity,
        price: variant.productPrice,
        grandTotal:grandTotal,
        totalprice: item.quantity * variant.productPrice,
        address: selectedAddress,
        payment_Method: paymentMethodId,
        status: "Pending",
        created_at: new Date(),
      };

      // Push the new order to the user's orders array
      user.orders.push(newOrder);
    }

    // Clear the cart after creating orders
    user.cart.products = [];

    // Save the updated user document
    await user.save();

    res
      .status(200)
      .json({ message: "Orders placed successfully", orders: user.orders });
  } catch (error) {
    console.error("Error placing the order: ", error);
    res.status(500).json({ error: "Error placing the order" });
  }
};



const razorpaypayment = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(amount);

    const response = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      payment_capture: 1,
    });

    res.status(200).json({
      apiKey: process.env.RAZORPAY_KEY_ID,
      amount: amount,
      id: response.id,
    });

    // Redirect to /shop after sending JSON response
    // res.redirect("/shop");
  } catch (error) {
    console.error("Error creating the order: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error creating the order",
    });
  }
};

const placeorder = async (req, res) => {

  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, addressId, paymentMethodId,  grandTotal } = req.body

    // Find the user by ID
    const user = await Users.findById(userId).populate("cart.products");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the selected address in the user's addresses array
    const selectedAddress = user.addresses.find(
      (address) => address._id == addressId
    );

    if (!selectedAddress) {
      return res.status(404).json({ message: "Selected address not found" });
    }

    // Get all products in the cart
    const allProducts = user.cart.products;
    // console.log(allProducts)

    if (allProducts.length === 0) {
      return res
        .status(400)
        .json({ message: "No products in the cart" });
    }

    // Iterate through each product in the cart and create a new order object
    for (const item of allProducts) {
      const product = await Product.findOne({
        _id: item.productId,
        'variants.productRam': item.productRam,
        'variants.productRom': item.productRom
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Find the variant matching the RAM and ROM
      const variant = product.variants.find(v => v.productRam === item.productRam && v.productRom === item.productRom);

      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      const postorder = {
        // orderId: new mongoose.Types.ObjectId(),
        productId: item.productId,
        quantity: item.quantity,
        price: variant.productPrice,
        totalprice: item.quantity * variant.productPrice,
        grandTotal:grandTotal,
        address: selectedAddress,
        payment_Method: paymentMethodId,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        status: "Pending",
        created_at: new Date(),
      };

      // Push the new order to the user's orders array
      user.orders.push(postorder);
    }

    // Clear the cart after creating orders
    user.cart.products = [];

    // Save the updated user document
    await user.save();

    res
      .status(200)
      .json({ message: "Orders placed successfully", orders: user.orders });
  } catch (error) {
    console.error("Error placing the order: ", error);
    res.status(500).json({ error: "Error placing the order" });
  }
}


const validateCoupon = async (req, res) => {
  const { couponCode } = req.body;
  // console.log(req.body);
  try {
    // Find the admin document containing the coupons
    const admin = await Admin.findOne();

    // Check if the coupon code exists in the admin's coupons array
    const couponExists = admin.Coupon.find(coupon => coupon.Coupon_Name === couponCode);
    if (couponExists) {
      res.status(200).json({ message: "Coupon applied successfully!", couponValue: couponExists.Coupon_Value });
    } else {
      res.status(404).json({ message: "Coupon not found. Please enter a valid coupon code." });
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ message: "Error validating coupon. Please try again later." });
  }
}



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
  // renderbrandcategory,
  renderbrands,
  removeFromWishlist,
  sort,
  Getsort,
  renderContact,
  handleContact,
  renderAbout,
  renderCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  // handlesingleProduct,
  // handleGoogleCallback,
  forgotGetPage,
  forgotEmailPostPage,
  resetPassword,
  successGoogleLogin,
  failureGooglelogin,
  handleLogout,
  Cod,
  rendercheckout,
  Address,
  razorpaypayment,
  placeorder,
  validateCoupon,
  cancelOrder,
};
