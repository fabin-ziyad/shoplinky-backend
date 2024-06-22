const Product = require("../models/product");
const Collection = require("../models/collection");
const User = require("../models/user");
const { uploadFile } = require("../config/cloudflare-r2");
const handleApiResponse = require("../utils/responseHandler");
const { createSlug } = require("../utils/common");
exports.createProduct = async (req, res) => {
  const { data } = req.body;
  const user = req.user;
  const {
    name,
    description,
    price,
    discount,
    link,
    selectedCategories,
    image,
  } = data;

  if (!name || !description || !price || !discount || !link) {
    return res
      .status(400)
      .json({ success: false, message: "Required fields missing" });
  }

  if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
    return handleApiResponse.handleApiError(
      res,
      400,
      "selectedCategories must be a non-empty array"
    );
  }

  const findUser = await User.findOne({ email: user.email });
  if (!findUser) {
    return handleApiResponse.handleApiError(res, 404, "Unable to fetch user");
  }
  const slug = `product-${createSlug(name)}`;
  try {
    // Create the product instance
    const product = new Product({
      name,
      description,
      price,
      discount,
      link,
      user: findUser._id,
      collections: selectedCategories,
      image,
      slug,
      status: true,
    });

    await product.save();

    // Update each collection to add the product ID
    const updatePromises = selectedCategories.map(async (categoryId) => {
      return Collection.findByIdAndUpdate(
        categoryId,
        { $addToSet: { products: product._id } }, // Use $addToSet to avoid duplicates
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product created successfully",
      product
    );
  } catch (error) {
    console.error("Error in createProduct:", error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Failed to create Product"
    );
  }
};

exports.editProduct = async (req, res) => {
  const { slug } = req.params;
  console.log("456", req.params);
  try {
    const newSlug = `product-${createSlug(req?.body?.name)}`;
    const product = await Product.findOneAndUpdate(
      { slug },
      { ...req.body, slug: newSlug },
      { new: true }
    );
    if (!product) {
      return handleApiResponse.handleApiError(res, 400, "Product not found");
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product updated successfully",
      product
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error?.message || "something went wrong"
    );
  }
};

exports.toggleStatus = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) {
      return handleApiResponse.handleApiError(res, 400, "Product Not Found");
    }
    product.isActive = !product.isActive;

    await product.save();
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product status updated successfully",
      product
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      error.message || "something went wrong"
    );
  }
};
exports.deleteProduct = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOneAndDelete({ slug });
    if (!product) {
      return handleApiResponse.handleApiError(res, 400, "Product Not Found");
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product created successfully"
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      error.message || "something went wrong"
    );
  }
};

// Get all product entries
exports.getAllProduct = async (req, res) => {
  const { id } = req.user;
  try {
    const product = await Product.find({ user: id });
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get a single product entry by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("product not found");
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) {
      return handleApiResponse.handleApiError(res, 400, "Product not found");
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product fetched successfully",
      product
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "something went wrong"
    );
  }
};

exports.getByType = async (req, res) => {
  try {
    const { type, typeId } = req.body.data; // Destructuring data from the request body
    let products;

    switch (type) {
      case "collection":
        products = await Product.find({
          collections: { $in: typeId },
        }).populate("collections"); // Assuming typeId represents the collection ID
        break;
      case "category":
        products = await Product.find({ category: typeId }).populate(
          "category"
        ); // Assuming typeId represents the category ID
        break;
      case "brand":
        products = await Product.find({ brand: typeId }).populate("brand");
        break;
      // Add more cases for other types if needed
      default:
        return handleApiResponse.handleApiError(res, 404, "Product not found");
    }

    if (!products || products.length === 0) {
      return handleApiResponse.handleApiError(res, 404, "No products found");
    }

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Successfully fetched",
      products
    );
  } catch (error) {
    console.error(error);
    return handleApiResponse.handleApiError(res, 500, "Internal Server Error");
  }
};
