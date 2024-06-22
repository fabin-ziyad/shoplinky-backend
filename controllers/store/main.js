const User = require("../../models/user");
const {
  handleApiError,
  handleApiSuccess,
} = require("../../utils/responseHandler");

exports.getMyStoreData = async (req, res) => {
  const { store } = req.params;
  try {
    const findStore = await User.findOne({ "store.name": store });
    if (!findStore) {
      return handleApiError(res, 400, "Store not found");
    }
    return handleApiSuccess(
      res,
      200,
      "Store details fetched successfully",
      findStore
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "Something went wrong");
  }
};
