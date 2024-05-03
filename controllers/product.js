const express = require('express');
const path = require('path');
const Brand = require('../models/Brand');
const Admin = require('../models/Admin');
const mongoose = require('mongoose')
const Categorys = require('../models/Category');
const Product = require('../models/Product'); // Update the import based on your model file path
const cloudinary = require('../utils/cloudinary');// Update the import based on your cloudinary setup

const renderProduct = async function (req, res) {
  try {
    const category = await Categorys.find();
    const brand = await Brand.find()
    const products = await Product.find();
    res.render('admin/product', { products, category, brand });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const handleProduct = async (req, res) => {
  console.log("asjlgusgfufff : ", req.body);
  try {


    const {
      productName,
      productCategory,
      productBrand,
      productColor,
      productMrp,
      productDescription,
      variants  // Assuming variants is an array of variant objects
    } = req.body;

    let existingProduct = await Product.findOne({
      name: productName,
      description: productDescription
    });

    if (!existingProduct) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
      // console.log(imageUrls);

      const newProduct = new Product({
        productImage: imageUrls,
        productName: productName,
        productCategory: productCategory,
        productBrand: productBrand,
        productColor: productColor,
        productMrp: productMrp,
        productDescription: productDescription,
        variants: variants // Assign the variants array
      });

      await newProduct.save();
      res.redirect('/admin/product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Error adding the product' });
  }
};



const editProduct = async (req, res) => {
  const productId = req.body.productId;
  try {
    // Find the product by ID
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product data based on the form fields
    existingProduct.productName = req.body.editProductName;
    // Update other fields as needed

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};


const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};


const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const {
    productName,
    productCategory,
    productBrand,
    productColor,
    productMrp,
    productDescription,
    variants // Add variants data to be received from the request body
  } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if files exist in the request
    if (req.files && req.files.length > 0) {
      // Handle file uploads
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
      product.productImage = imageUrls;
    }

    // Update product details
    product.productName = productName;
    product.productCategory = productCategory;
    product.productBrand = productBrand;
    product.productColor = productColor;
    product.productMrp = productMrp;
    product.productDescription = productDescription;

    // Handle variants update
    if (variants && variants.length > 0) {
      product.variants = variants;
    }

    await product.save();

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};


const renderBrand = async function (req, res) {
  try {
    const brand = await Brand.find();
    res.render('admin/brand', { brand });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};


const handleBrand = async (req, res) => {
  try {
    const { BrandName } = req.body;

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

    const newBrand = new Brand({
      BrandName: BrandName,
      BrandImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newBrand.save();
    res.redirect('/admin/brand');
  } catch (error) {
    console.error('Error adding Brand:', error);
    res.status(500).json({ error: 'Error adding the Brand' });
  }
};

const editBrand = async (req, res) => {
  const BrandId = req.body.BrandId;
  console.log(req.body);

  try {
    // Find the Brand by ID
    const existingBrand = await Brand.findById(BrandId);

    if (!existingBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Update the Brand data based on the form fields
    existingBrand.BrandName = req.body.editBrandName;
    // Update other fields as needed

    // Save the updated Brand
    const updatedBrand = await existingBrand.save();

    res.status(200).json({ message: 'Brand updated successfully', updatedBrand });
  } catch (error) {
    console.error('Error updating Brand:', error);
    res.status(500).json({ error: 'Error updating Brand' });
  }
};


const deleteBrand = async (req, res) => {
  const BrandId = req.params.id;

  try {
    const deletedBrand = await Brand.findByIdAndDelete(BrandId);

    if (!deletedBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(200).json({ message: 'Brand deleted successfully', deletedBrand });
  } catch (error) {
    console.error('Error deleting Brand:', error);
    res.status(500).json({ error: 'Error deleting Brand' });
  }
};

const updateBrand = async (req, res) => {
  const BrandId = req.params.id;
  const { BrandName } = req.body;

  try {
    const Brands = await Brand.findById(BrandId);

    if (!Brands) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Update Brand details
    if (req.files && req.files.length > 0) {
      // If there are files, update BrandImage
      const desiredWidth = 300;
      const desiredHeight = 200;

      const result = await cloudinary.uploader.upload(req.files[0].path, {
        width: desiredWidth,
        height: desiredHeight,
        crop: 'scale',
      });


      if (Brands.BrandImage && Brands.BrandImage.public_id) {
        // Destroy the previous image on Cloudinary
        await cloudinary.uploader.destroy(Brands.BrandImage.public_id);
      }

      Brands.BrandImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    console.log(req.files);
    // Update other fields as needed
    Brands.BrandName = BrandName;


    // Save the updated Brand
    await Brands.save();
    res.json({ message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating Brand:', error);
    res.status(500).json({ error: 'Error updating Brand' });
  }
};


const renderBanner = async function (req, res) {
  try {
    const admin = await Admin.findOne();
    const banner = admin.Banner;
    console.log(banner)
    res.render('admin/banner', { banner });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};


const handleBanner = async (req, res) => {
  try {
    const { Position } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const admin = await Admin.findOne()

    // const desiredWidth = 300;
    // const desiredHeight = 200;

    const result = await cloudinary.uploader.upload(req.files[0].path, {
      // width: desiredWidth,
      // height: desiredHeight,
      // crop: 'scale',
    });

    const newBanner = {
      Position: Position,
      BannerImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    }

    admin.Banner.push(newBanner)
    await admin.save();
    res.redirect('/admin/banner');
  } catch (error) {
    console.error('Error adding Banner:', error);
    res.status(500).json({ error: 'Error adding the Banner' });
  }
};


const deleteBanner = async (req, res) => {
  const BannerId = req.params.id;

  try {
    const deletedBanner = await Admin.findByIdAndDelete(BannerId);

    if (!deletedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.status(200).json({ message: 'Banner deleted successfully', deletedBanner });
  } catch (error) {
    console.error('Error deleting Banner:', error);
    res.status(500).json({ error: 'Error deleting Banner' });
  }
};


module.exports = {
  renderProduct,
  handleProduct,
  editProduct,
  deleteProduct,
  updateProduct,
  renderBrand,
  handleBrand,
  editBrand,
  deleteBrand,
  updateBrand,
  renderBanner,
  handleBanner,
  deleteBanner,
};
