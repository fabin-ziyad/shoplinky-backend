const Content = require("../../models/content");
const User = require("../../models/user");
const {
  handleApiError,
  handleApiSuccess,
} = require("../../utils/responseHandler");
// Get all content entries
exports.getContent = async (req, res) => {
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

    const content = await Content.find({ user: associatedUserId });
    if (!content) {
      return handleApiError(
        res,
        404,
        "No content found for the user with this store name"
      );
    }

    return handleApiSuccess(res, 200, "Fetched content by store name", content);
  } catch (error) {
    return handleApiError(
      res,
      500,
      error.message || "Something went wrong while fetching the content"
    );
  }
};

// Get a single content entry by slug
exports.getContentBySlug = async (req, res) => {
  const { slug, store } = req.params;
  console.log("Received slug:", slug);

  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiError(res, 400, "Store not found");
    }
    const content = await Content.findOne({ slug: slug, user: findStore?._id })
      .populate("products")
      .populate("category");
    if (!content) {
      return handleApiError(res, 404, "Content not found");
    }

    return handleApiSuccess(res, 200, "Fetched the content", content);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch the content",
      error: error.message,
    });
  }
};

exports.getAllStoreContents = async (req, res) => {
  const { store } = req.params;
  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiError(res, 400, "Store not found");
    }
    const contents = await Content.find({ user: findStore?._id });
    if (!contents) {
      return handleApiError(res, 400, "Contents not found");
    }
    return handleApiSuccess(
      res,
      200,
      "Contents fetched successfully",
      contents
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "something went wrong");
  }
};
