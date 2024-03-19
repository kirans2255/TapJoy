const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const Product = require('../models/Product'); // Update the import based on your model file path
const Category = require('../models/Category')
const cloudinary = require('../utils/cloudinary');// Update the import based on your cloudinary setup

const renderProduct = async function (req, res) {
    try {
        const category = await Category.find()
        const products = await Product.find();
        res.render('admin/product', { products, category });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
};


const handleProduct = async (req, res) => {
    try {
        const {
            productName,
            productCategory,
            subproductCategory,
            productBrand,
            productColor,
            productMrp,
            productPrice,
            productDescription,
        } = req.body;

        let existingProduct = await Product.findOne({
            name: productName,
            description: productDescription,
            price: productPrice,
        });

        if (!existingProduct) {
            const imageUrls = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imageUrls.push(result.secure_url);
            }
            console.log(imageUrls);

            const newProduct = new Product({
                productImage: imageUrls,
                productName: productName,
                productCategory: productCategory,
                subproductCategory: subproductCategory,
                productBrand: productBrand,
                productColor: productColor,
                productMrp: productMrp,
                productPrice: productPrice,
                productDescription: productDescription,
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
        subproductCategory,
        productBrand,
        productColor,
        productMrp,
        productPrice,
        productDescription,
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
        product.subproductCategory = subproductCategory;
        product.productBrand = productBrand;
        product.productColor = productColor;
        product.productMrp = productMrp;
        product.productPrice = productPrice;
        product.productDescription = productDescription;

        await product.save();

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};

module.exports = {
    renderProduct,
    handleProduct,
    editProduct,
    deleteProduct,
    updateProduct,
};


