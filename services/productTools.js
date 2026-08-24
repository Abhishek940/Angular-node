const Product = require("../models/productModel");

async function getAllProducts() {
  return await Product.find().lean();
}

async function searchProducts(search) {
  if (!search || !search.trim()) {
    return [];
  }

  return await Product.find({
    name: {
      $regex: search.trim(),
      $options: "i",
    },
  }).lean();
}

async function getCheapestProduct() {
  return await Product.findOne()
    .sort({ price: 1 })
    .lean();
}

async function getMostExpensiveProduct() {
  return await Product.findOne()
    .sort({ price: -1 })
    .lean();
}

async function getProductCount() {
  const count = await Product.countDocuments();

  return {
    count,
  };
}

async function createProduct(name, price, quantity) {
  const product = await Product.create({
    name,
    price,
    quantity,
  });

  return product.toObject();
}

async function updateProduct(name, price, quantity) {
  const product = await Product.findOneAndUpdate(
    { name: { $regex: `^${name}$`, $options: "i" } },
    {
      price,
      quantity,
    },
    {
      new: true,
    }
  ).lean();

  if (!product) {
    return {
      success: false,
      message: `Product "${name}" not found.`,
    };
  }

  return product;
}

async function deleteProduct(name) {
  const product = await Product.findOneAndDelete({
    name: {
      $regex: `^${name}$`,
      $options: "i",
    },
  }).lean();

  if (!product) {
    return {
      success: false,
      message: `Product "${name}" not found.`,
    };
  }

  return {
    success: true,
    message: `Product "${name}" deleted successfully.`,
  };
}

module.exports = {
  getAllProducts,
  searchProducts,
  getCheapestProduct,
  getMostExpensiveProduct,
  getProductCount,
  createProduct,
  updateProduct,
  deleteProduct,
};