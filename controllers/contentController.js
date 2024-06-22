const Content = require("../models/content");
const { uploadFile } = require("../config/cloudflare-r2");
const Products = require("../models/product");
const User = require("../models/user");
const handleApiResponse = require("../utils/responseHandler");
const { getMissingFields, createSlug } = require("../utils/common");
exports.createContent = async (req, res) => {
  const { email } = req.user;
  const requiredFields = ["title", "image"];
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
  const { title, image, type } = req.body.data;
  try {
    const findContentExists = await Content.findOne({ title });
    if (findContentExists) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Content exists with this name"
      );
    }
    const slug = createSlug(title);
    const newContent = new Content({
      title,
      image,
      products: [],
      slug,
      type,
      user: user?._id,
    });
    if (!newContent) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Failed to create this content"
      );
    }

    await newContent.save();

    return handleApiResponse.handleApiSuccess(
      res,
      201,
      "Content created successfully",
      newContent
    );
  } catch (error) {
    console.error("Error in create content:", error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong with content creation"
    );
  }
};

// Get all content entries
exports.getAllContent = async (req, res) => {
  const { id } = req.user;
  try {
    const content = await Content.find({ user: id });
    res.status(200).json({
      success: true,
      message: "Fetched all content",
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// Get a single content entry by ID
exports.getContentBySlug = async (req, res) => {
  try {
    const content = await Content.findOne({ slug: req.params.slug }).populate(
      "products"
    );
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched the content",
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch the content",
      error: error.message,
    });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const existsingContent = await Content.findOne({ slug: req.params.slug });
    if (!existsingContent) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Collections not found"
      );
    }

    const updatedContent = await Content.findByIdAndUpdate(
      existsingContent._id,
      { ...req.body.data }
    );
    await updatedContent.save();
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Content updated successfully",
      updatedContent
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong with updating Content"
    );
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({ slug: req.params.slug });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
      data: content,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

exports.addProductToContent = async (req, res) => {
  const { slug } = req.params;
  const productIds = req.body.data;
  console.log(slug, productIds);
  try {
    const findContent = await Content.findOne({ slug });
    if (!findContent) {
      return handleApiResponse.handleApiError(res, 400, "Content not found");
    }

    const existingProductIds = findContent.products.map((product) =>
      product.toString()
    );

    const newProductIds = productIds.filter(
      (productId) => !existingProductIds.includes(productId)
    );

    if (newProductIds.length === 0) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "This products already exists in the content"
      );
    }

    // Add new product IDs to the collection
    findContent.products.push(...newProductIds);
    await findContent.save();

    // Update each product's collection array
    await Promise.all(
      newProductIds.map(async (productId) => {
        const product = await Products.findById(productId);
        if (product) {
          const contentExists = product.contents.includes(findContent?._id);
          if (!contentExists) {
            product.contents.push(findContent?._id);
            await product.save();
          }
        }
      })
    );

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Products added successfully",
      findContent
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

exports.removeProductFromContent = async (req, res) => {
  const { slug } = req.params;
  const { productId } = req.body;

  try {
    const content = await Content.findOne({ slug });
    if (!content) {
      return handleApiResponse.handleApiError(res, 404, "Content not found");
    }

    if (!content.products.includes(productId)) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "Product not found in this Content"
      );
    }

    content.products.pull(productId);
    await content.save();

    const product = await Products.findById(productId);
    if (!product) {
      return handleApiResponse.handleApiError(res, 404, "Product not found");
    }

    product.contents.pull(content?._id);
    await product.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Product removed from content",
      { content, product }
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

exports.toggleStatus = async (req, res) => {
  const { slug } = req.params;
  try {
    const content = await Content.findOne({ slug });

    if (!content) {
      return handleApiResponse.handleApiError(res, 404, "Content not found");
    }

    content.isActive = !content.isActive;

    await content.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Content status updated",
      content
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};
