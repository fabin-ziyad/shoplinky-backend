const Product = require("../../models/product");
const User = require("../../models/user");
const {
  handleApiError,
  handleApiSuccess,
} = require("../../utils/responseHandler");
// Get all product entries
exports.getProduct = async (req, res) => {
    const { store, id } = req.params;

    try {
        const userStore = await User.findOne({ "store.name": store });
        if (!userStore) {
            return handleApiResponse.handleApiError(res, 404, "No user associated with this store name");
        }

        const associatedUserId = userStore._id;

        const products = await Product.find({ user: associatedUserId })
        if (!products) {
            return handleApiResponse.handleApiError(res, 404, "No product found for the user with this store name");
        }

        return handleApiResponse.handleApiSuccess(res, 200, "Fetched product by store name", products);
    } catch (error) {
        return handleApiResponse.handleApiError(
            res,
            500,
            error.message || "Something went wrong while fetching the product"
        );
    }
};

exports.getAllStoreProducts = async (req, res) => {
  const { store } = req.params;
  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiError(res, 400, "Store not found");
    }
    const products = await Product.find({ user: findStore?._id });
    if (!products) {
      return handleApiError(res, 400, "Products not found");
    }
    return handleApiSuccess(
      res,
      200,
      "Products fetched successfully",
      products
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "something went wrong");
  }
};
