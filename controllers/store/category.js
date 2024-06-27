const Category = require("../../models/category");
const Product = require('../../models/product'); 
const User = require("../../models/user");
const Content = require('../../models/content'); // Import your Content (or Posts) model

const {
    handleApiError,
    handleApiSuccess,
} = require("../../utils/responseHandler");
// Get all category entries
exports.getCategory = async (req, res) => {
    const { store } = req.params;

    try {
        const userStore = await User.findOne({ "store.name": store });
        if (!userStore) {
            return handleApiError(
                res,
                404,
                "No user associated with this store name"
            );
        }

        const associatedUserId = userStore._id;

        const category = await Category.find({ user: associatedUserId });
        if (!category) {
            return handleApiError(
                res,
                404,
                "No category found for the user with this store name"
            );
        }

        return handleApiSuccess(res, 200, "Fetched category by store name", category);
    } catch (error) {
        return handleApiError(
            res,
            500,
            error.message || "Something went wrong while fetching the category"
        );
    }
};

// Get a single category entry by slug
exports.getCategoryBySlug = async (req, res) => {
    const { slug, store } = req.params;
    console.log("Received slug:", slug);

    try {
        const findStore = await User.findOne({ "store.name": store });
        if (!findStore) {
            return handleApiError(res, 400, "Store not found");
        }
        const category = await Category.findOne({ slug: slug, user: findStore?._id })
            .populate("items");
        if (!category) {
            return handleApiError(res, 404, "Category not found");
        }

        return handleApiSuccess(res, 200, "Fetched the category", category);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch the category",
            error: error.message,
        });
    }
};

exports.getAllStoreCategories = async (req, res) => {
    const { store } = req.params;
    try {
        // Find the store based on the store name
        const findStore = await User.findOne({ "store.name": store });
        if (!findStore) {
            return handleApiError(res, 400, "Store not found");
        }

        // Fetch categories for the store user
        const categories = await Category.find({ user: findStore._id });
        if (!categories || categories.length === 0) {
            return handleApiError(res, 400, "Categories not found");
        }

        // Populate product or content details for each category's items
        const categoriesWithDetails = await Promise.all(categories.map(async (category) => {
            if (category.type === "Product") {
                // Fetch full product details for the items
                const detailedItems = await Product.find({
                    _id: { $in: category.items }
                });
                return {
                    ...category._doc, // Use the spread operator to include all fields
                    items: detailedItems
                };
            } else if (category.type === "Content") {
                // Fetch full content details for the items
                const detailedItems = await Content.find({
                    _id: { $in: category.items }
                });
                return {
                    ...category._doc, // Use the spread operator to include all fields
                    items: detailedItems
                };
            }
            return category; // Return category as-is for other types
        }));

        // Send the response with detailed categories
        return handleApiSuccess(
            res,
            200,
            "Categories fetched successfully",
            categoriesWithDetails
        );
    } catch (error) {
        return handleApiError(res, 500, error.message || "Something went wrong");
    }
};
