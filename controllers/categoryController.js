const Category = require("../models/category");
const Products = require("../models/product");
const Content = require("../models/content");
const User = require("../models/user");
const handleApiResponse = require("../utils/responseHandler");
const { getMissingFields, createSlug } = require("../utils/common");
exports.createCategory = async (req, res) => {
  const { email } = req.user;
  try {
    const requiredFields = ["name", "type"];
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
    const { name, type } = req.body.data;
    const slug = `category-${createSlug(name)}`;
    const category = new Category({ name, type, slug, user: user?._id });
    if (!category) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Failed to created category"
      );
    }
    await category.save();
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Category created successfully",
      category
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  const { id } = req.user;
  try {
    const categories = await Category.find({user:id});
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Fetched all categories",
      categories
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "something went wrong"
    );
  }
};

// Get a single category by ID
exports.getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      return handleApiResponse.handleApiError(res, 400, "Category not found");
    }

    const itemIds = category.items;

    let itemsData = [];

    for (const itemId of itemIds) {
      let itemData;
      if (category.type === "Product") {
        itemData = await Products.findById(itemId);
      } else {
        itemData = await Content.findById(itemId);
      }

      if (itemData) {
        itemsData.push(itemData);
      }
    }

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Fetched the category data with items",
      { ...category.toObject(), items: itemsData }
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error?.message || "Something went wrong"
    );
  }
};
exports.addItemToCategory = async (req, res) => {
  const { slug } = req.params;
  const ItemIds = req.body.data;
  console.log(slug, ItemIds);
  try {
    const findCategory = await Category.findOne({ slug });
    if (!findCategory) {
      return handleApiResponse.handleApiError(res, 400, "Category not found");
    }

    const existingProductIds = findCategory.items.map((item) =>
      item.toString()
    );

    const newItemIds = ItemIds.filter(
      (itemId) => !existingProductIds.includes(itemId)
    );

    if (newItemIds.length === 0) {
      return handleApiResponse.handleApiError(
        res,
        400,
        "This item already exists in the category"
      );
    }

    // Add new item IDs to the collection
    findCategory.items.push(...newItemIds);
    await findCategory.save();

    // Update each product's collection array
    if (findCategory.type === "Product") {
      await Promise.all(
        newItemIds.map(async (productId) => {
          const product = await Products.findById(productId);
          if (product) {
            const contentExists = product.category.includes(findCategory?._id);
            if (!contentExists) {
              product.category.push(findCategory?._id);
              await product.save();
            }
          }
        })
      );
    } else {
      await Promise.all(
        newItemIds.map(async (itemId) => {
          const content = await Content.findById(itemId);
          if (content) {
            const contentExists = content.category.includes(findCategory?._id);
            if (!contentExists) {
              content.category.push(findCategory?._id);
              await content.save();
            }
          }
        })
      );
    }

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Item added successfully",
      findCategory
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
exports.removeItemFromCategory = async (req, res) => {
  const { slug } = req.params;
  const { itemId } = req.body;

  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      return handleApiResponse.handleApiError(res, 404, "Category not found");
    }

    if (!category.items.includes(itemId)) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "Item not found in this Category"
      );
    }

    category.items.pull(itemId);
    await category.save();

    let itemData;
    if (category.type === "Content") {
      itemData = await Content.findById(itemId);
    } else {
      itemData = await Products.findById(itemId);
    }

    if (!itemData) {
      return handleApiResponse.handleApiError(res, 404, "Item not found");
    }

    itemData.category.pull(category?._id);
    await itemData.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Item removed from Category",
      { category, itemData }
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
exports.updateCategory = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "type"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      message: "Invalid updates!",
    });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    updates.forEach((update) => (category[update] = req.body[update]));
    await category.save();
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOneAndDelete({ slug });
    if (!category) {
      return handleApiResponse.handleApiError(res, 400, "Category not found");
    }
    return handleApiResponse.handleApiError(
      res,
      200,
      "Category deleted successfully",
      category
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
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug });

    if (!category) {
      return handleApiResponse.handleApiError(res, 404, "Category not found");
    }

    category.isActive = !category.isActive;

    await category.save();

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Category status updated",
      category
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};
