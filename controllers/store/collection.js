const Collections = require("../../models/collection");
const User = require("../../models/user");
const handleApiResponse = require("../../utils/responseHandler");

exports.getCollections = async (req, res) => {
  const { store } = req.params;

  try {
    const userStore = await User.findOne({ "store.name": store });
    if (!userStore) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "No user associated with this store name"
      );
    }

    const associatedUserId = userStore._id;

    const collections = await Collections.find({ user: associatedUserId });
    if (!collections || collections.length === 0) {
      return handleApiResponse.handleApiError(
        res,
        404,
        "No collections found for the user with this store name"
      );
    }

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Fetched collections by store name",
      collections
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong while fetching the collections"
    );
  }
};

// Get a single collections by slug
exports.getCollectionsBySlug = async (req, res) => {
  const { slug, store } = req.params;
  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiResponse.handleApiError(res, 400, "Store not found");
    }
    const collections = await Collections.findOne({
      user: findStore?._id,
      slug: slug,
    }).populate(["products","user"]);

    if (!collections) {
      return handleApiResponse.handleApiError(res, 400, "Collection not found");
    }

    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "collection data fetched successfully",
      collections
    );
  } catch (error) {
    console.error("Error fetching collection by slug:", error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};

exports.getAllStoreCollections = async (req, res) => {
  console.log(req.params);
  const { store } = req.params;
  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiResponse.handleApiError(res, 400, "Store not found");
    }
    const collections = await Collections.find({ user: findStore?._id });
    if (!collections) {
      return handleApiResponse.handleApiError(res, 400, "Collection not found");
    }
    return handleApiResponse.handleApiSuccess(
      res,
      200,
      "Collection fetched successfully",
      collections
    );
  } catch (error) {
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "something went wrong"
    );
  }
};
