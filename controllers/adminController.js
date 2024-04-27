const User = require('../models/Admin');
const Categorys = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const cloudinary = require('../utils/cloudinary');// Update the import based on your cloudinary setup
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Users = require('../models/User');
const Product = require('../models/Product');

// const multer = require('multer');
// const Category = require('../models/Category');
// const upload = multer({ dest: 'uploads/' });
// const Category = require('../models/Category');
// const { log } = require('handlebars/runtime');
require('dotenv').config();


// Render the home view
const renderHome = (req, res) => {
  if (req.cookies.jwt) {
    res.redirect('/admin/dash')
  } else {
    res.render('admin/signin');
  };
}
// Render the dashboard view
const renderDashboard = (req, res) => {
  res.render('admin/dashboard');
};
const renderCategory = async function (req, res) {
  try {
    const category = await Categorys.find();
    res.render('admin/category', { category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Error fetching category' });
  }
};

// Render the profile view
// const renderProduct = (req, res) => {
//   res.render('admin/product');
// };

const handleSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const errorMessage = "Admin not found";
      return res.status(404).render('admin/signin', { error: errorMessage });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      const errorMessage = "Invalid password";
      return res.status(401).render('admin/signin', { error: errorMessage });
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

    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24-hour expiry

    res.redirect("/admin/dash");
    console.log("Admin logged in with email and password: jwt created");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// FORGOT PASSWORD -- STARTS FROM HERE
// FORGOT PASSWORD PAGE DISPLAY
let forgotGetPage = async (req, res) => {
  try {
    return res.render("admin/forgot-password");
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

    res.render("admin/otp", { email });
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

      return res.status(404).json({ message: "Admin not found" });
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

    res.status(200).redirect("/admin");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// FORGOT PASSWORD -- ENDS HERE

////Category
const handleCategory = async (req, res) => {
  try {
    const { CategoryName } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const desiredWidth = 300;
    const desiredHeight = 200;

    const result = await cloudinary.uploader.upload(req.files[0].path, {
      width: desiredWidth,
      height: desiredHeight,
      crop: 'scale',
    });

    const newCategory = new Categorys({
      CategoryName: CategoryName,
      CategoryImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newCategory.save();
    res.redirect('/admin/category');
  } catch (error) {
    console.error('Error adding Category:', error);
    res.status(500).json({ error: 'Error adding the Category' });
  }
};

const editCategory = async (req, res) => {
  const CategoryId = req.body.CategoryId;
  console.log(req.body);

  try {
    // Find the Category by ID
    const existingCategory = await Categorys.findById(CategoryId);

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update the Category data based on the form fields
    existingCategory.CategoryName = req.body.editCategoryName;
    // Update other fields as needed

    // Save the updated Category
    const updatedCategory = await existingCategory.save();

    res.status(200).json({ message: 'Category updated successfully', updatedCategory });
  } catch (error) {
    console.error('Error updating Category:', error);
    res.status(500).json({ error: 'Error updating Category' });
  }
};


const deleteCategory = async (req, res) => {
  const CategoryId = req.params.id;

  try {
    const deletedCategory = await Categorys.findByIdAndDelete(CategoryId);

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
    console.error('Error deleting Category:', error);
    res.status(500).json({ error: 'Error deleting Category' });
  }
};

const updateCategory = async (req, res) => {
  const CategoryId = req.params.id;
  const { CategoryName } = req.body;

  try {
    const Category = await Categorys.findById(CategoryId);

    if (!Category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update Category details
    if (req.files && req.files.length > 0) {
      // If there are files, update CategoryImage
      const desiredWidth = 300;
      const desiredHeight = 200;

      const result = await cloudinary.uploader.upload(req.files[0].path, {
        width: desiredWidth,
        height: desiredHeight,
        crop: 'scale',
      });


      if (Category.CategoryImage && Category.CategoryImage.public_id) {
        // Destroy the previous image on Cloudinary
        await cloudinary.uploader.destroy(Category.CategoryImage.public_id);
      }

      Category.CategoryImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    console.log(req.files);
    // Update other fields as needed
    Category.CategoryName = CategoryName;


    // Save the updated Category
    await Category.save();
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating Category:', error);
    res.status(500).json({ error: 'Error updating Category' });
  }
};


/////////Category Ending

// Route handler for handling logout
const handleLogout = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/admin"); // If no token, redirect to login
  }

  try {
    res.clearCookie("jwt"); // Clear the JWT cookie
    res.redirect("/admin");
    console.log("Admin logged out");
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).send("Internal Server Error");
  }
};


//order

// const renderOrder = async (req, res) => {
//   try {
//     // Fetch all orders from the database
//     const usersWithOrders = await Users.find().populate({
//       path: 'orders',
//       populate: {
//         path: 'productId',
//         model: 'Product' // Assuming 'Product' is the name of your product model
//       }
//     });

//     // Extract orders from each user
//     const orders = usersWithOrders.reduce((acc, user) => {
//       acc.push(...user.orders);
//       return acc;
//     }, []);

//     res.render('admin/order', { orders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).render('error', { errorMessage: "Error fetching orders" });
//   }
// };


const renderOrder = async (req, res) => {
  try {
    // Fetch all orders from the database
    const usersWithOrders = await Users.find().populate({
      path: 'orders',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });

    // Extract orders from each user
    const orders = usersWithOrders.reduce((acc, user) => {
      acc.push(...user.orders.map(order => ({
        orderId: order._id,
        productName: order.productId.productName,
        userName: user.name,
        payment_Method: order.payment_Method,
        totalprice: order.totalprice,
        productImage: order.productId.productImage[0],
      })));
      return acc;
    }, []);

    res.render('admin/order', { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).render('error', { errorMessage: "Error fetching orders" });
  }
};



const fetchOrder = async (req, res) => {
  const orderId = req.params.id;
  try {
    // Find the order containing the orderId
    const order = await Users.findOne({ "orders._id": orderId });  
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the specific order within the orders array
    const foundOrder = order.orders.find(o => o._id.toString() === orderId);
    if (!foundOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Get the product ID from the found order
    const productId = foundOrder.productId;

    // Find the user details
    const user = await Users.findById(order._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the product details using the product ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const ram = product.variants.productRam;
    // console.log("kkk",ram);


    res.json({
      _id: foundOrder._id,
      productName: product.productName,
      name: user.name, 
      quantity:foundOrder.quantity,
      price:foundOrder.price,
      address:foundOrder.address,
      payment_Method: foundOrder.payment_Method, 
      totalprice: foundOrder.totalprice,
      status: foundOrder.status,
      color: product.productColor,
      ram: foundOrder.productRam,
      rom:foundOrder.productRom,
      amount:foundOrder.grandTotal,
    });


  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const transporters = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const updatestatus = async (req, res) => {
  try {
    const { orderId, newStatus, productName } = req.body;

    const user = await Users.findOne();
    // console.log(user)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Finding the order within the user's orders and update its status
    const orderIndex = user.orders.findIndex(order => order._id.toString() === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Updating order status
    user.orders[orderIndex].status = newStatus;
    await user.save();

    // Sending email to user with HTML content
    await transporters.sendMail({
      from: 'your@email.com',
      to: user.email,
      subject: 'Order Status Updated',
      html: `
        <html>
          <head>
            <style>
              /* Add your CSS styles here */
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
              }
              h1 {
                color: #333333;
                text-align: center;
              }
              .message {
                background-color: #f2f2f2;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
              }
              .decoration {
                background-image: url('https://example.com/decoration.png');
                background-repeat: no-repeat;
                background-size: cover;
                height: 100px;
                margin-top: 20px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Order Status </h1>
              <div class="message">
                <p>Dear ${user.name},</p>
                <p>Your order "${productName}" with ID ${orderId} has been to ${newStatus}.</p>
                <p>Thank you.</p>
              </div>
              <div class="decoration"></div>
              <p style="text-align:center;">If you have any questions, feel free to <a href="mailto:medamu345@gmail.com">contact us</a>.</p>
            </div>
          </body>
        </html>
      `,
    });

    res.json({ updatedOrder: user.orders[orderIndex] });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


/////coupon
const renderCoupon = async (req, res) => {
  try {
    const admin = await User.findOne();
    const coupon = admin.Coupon.map(c => ({
      Coupon_Name: c.Coupon_Name,
      Coupon_Value: c.Coupon_Value,
      Coupon_Type: c.Coupon_Type,
      StartDate: c.StartDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      EndDate: c.EndDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      Coupon_Status: c.Coupon_Status
    }));
    res.render('admin/coupon', { coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: 'Error fetching coupon' });
  }
}



const handleCoupon = async (req, res) => {
  const { Coupon_Status,
    Coupon_Name,
    Coupon_Type,
    StartDate,
    EndDate,
    Coupon_Value,
  } = req.body
  //  console.log(req.body)
  try {

    const admin = await User.findOne()

    const newCoupon = {
      Coupon_Status: Coupon_Status,
      Coupon_Name: Coupon_Name,
      Coupon_Value: Coupon_Value,
      Coupon_Type: Coupon_Type,
      StartDate: StartDate,
      EndDate: EndDate,
    }

    admin.Coupon.push(newCoupon)
    await admin.save();
    res.redirect('/admin/Coupon');
  } catch (error) {
    console.error('Error adding Coupon:', error);
    res.status(500).json({ error: 'Error adding the Coupon' });
  }
}


module.exports = {
  renderDashboard,
  renderHome,
  handleCategory,
  editCategory,
  deleteCategory,
  updateCategory,
  handleSignin,
  renderCategory,
  forgotGetPage,
  forgotEmailPostPage,
  resetPassword,
  handleLogout,
  renderOrder,
  fetchOrder,
  updatestatus,
  renderCoupon,
  handleCoupon,

};
