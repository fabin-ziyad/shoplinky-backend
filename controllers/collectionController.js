const Collections = require("../models/collection");
const Products = require("../models/product");
const User = require("../models/user");
const handleApiResponse = require("../utils/responseHandler");
const { getMissingFields, createSlug } = require("../utils/common");

exports.createCollection = async (req, res) => {
  const { email } = req.user;
  const requiredFields = ["name", "description", "image"];
  const missingFields = getMissingFields(req.body.data, requiredFields);
  if (missingFields.length > 0) {
    return handleApiResponse.handleApiError(
      res,
      400,
      `Required fields missing: ${missingFields.join(", ")}`
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return handleApiResponse.handleApiError(res, 400, "User not found");
  }
  const { name, description, image } = req.body.data;
  const slug = `collection-${createSlug(name)}`;
  try {
    const collection = new Collections({
      name,
      description,
      image,
      slug,
      user: user?._id,
    });

    if (!collection) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Failed to create this collection"
      );
    }

    await collection.save();

    return handleApiResponse.handleApiSuccess(
      res,
      201,
      "Collection created successfully",
      collection
    );
  } catch (error) {
    console.error("Error in create Collection:", error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong with collection creation"
    );
  }
};

// Get all collections
exports.getCollections = async (req, res) => {
  const { id } = req.user;
  try {
    const collections = await Collections.find({ user: id });
    if (!collections) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "Unable to fetch collections"
      );
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Fetched all collections",
      collections
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Soemthing went wromg with collection fetching"
    );
  }
};

// Get a single collections by ID
exports.getCollectionsBySlug = async (req, res) => {
  const { slug } = req.params;
  console.log(req.params);
  try {
    const collections = await Collections.findOne({ slug }).populate(
      "products"
    );
    if (!collections) {
      return res.status(404).json({
        success: false,
        message: "Collections not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched the collections",
      data: collections,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch the collections",
      error: error.message,
    });
  }
};

exports.updateCollections = async (req, res) => {
  try {
    const collection = await Collections.findById(req.params.id);
    if (!collection) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Collections not found"
      );
    }

    const updatedCollection = await Collections.findByIdAndUpdate(
      collection._id,
      { ...req.body.data }
    );
    await updatedCollection.save();
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Collection updated successfully",
      updatedCollection
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong with updating collection"
    );
  }
};

exports.deleteCollections = async (req, res) => {
  try {
    const collection = await Collections.findByIdAndDelete(req.params.id);
    if (!collection) {
      return handleApiResponse.handleApiError(res, 404, "Collection not found");
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Collection deleted successfully",
      collection
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const collection = await Collections.findById(req.params.id);

    if (!collection) {
      return handleApiResponse.handleApiError(res, 404, "Collection not found");
    }

    collection.isActive = !collection.isActive;

    await collection.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Collection status toggled updated",
      collection
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};

exports.removeProductFromCollection = async (req, res) => {
  const { slug } = req.params;
  const { productId } = req.body;

  try {
    const collection = await Collections.findOne({ slug });
    if (!collection) {
      return handleApiResponse.handleApiError(res, 404, "Collection not found");
    }

    if (!collection.products.includes(productId)) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "Product not found in this collection"
      );
    }

    collection.products.pull(productId);
    await collection.save();

    const product = await Products.findById(productId);
    if (!product) {
      return handleApiResponse.handleApiError(res, 404, "Product not found");
    }

    if (product.collections.length <= 1) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Product should have at least one collection"
      );
    }

    product.collections.pull(collectionId);
    await product.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product removed from collection",
      { collection, product }
    );
  } catch (error) {
    console.log(error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};

exports.addProductToCollection = async (req, res) => {
  const { slug } = req.params;
  const productIds = req.body.data;
  try {
    const findCollection = await Collections.findOne({ slug });
    if (!findCollection) {
      return handleApiResponse.handleApiError(res, 400, "Collection not found");
    }

    const existingProductIds = findCollection.products.map((product) =>
      product.toString()
    );

    const newProductIds = productIds.filter(
      (productId) => !existingProductIds.includes(productId)
    );

    if (newProductIds.length === 0) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "All products are already in the collection"
      );
    }

    // Add new product IDs to the collection
    findCollection.products.push(...newProductIds);
    await findCollection.save();

    // Update each product's collection array
    await Promise.all(
      newProductIds.map(async (productId) => {
        const product = await Products.findById(productId);
        if (product) {
          const collectionExists = product.collections.includes(collectionId);
          if (!collectionExists) {
            product.collections.push(collectionId);
            await product.save();
          }
        }
      })
    );

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Products added successfully",
      findCollection
    );
  } catch (error) {
    console.log(error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};
