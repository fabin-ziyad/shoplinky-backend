const User = require("../models/user");
const Category = require("../models/category");
const {
  handleApiError,
  handleApiSuccess,
} = require("../utils/responseHandler");
const { getMissingFields, createSlug } = require("../utils/common");
exports.checkStoreName = async (req, res) => {
  const { storeName } = req.body;

  if (!storeName) {
    return handleApiError(res, 400, "Store name is required");
  }

  try {
    const existingUser = await User.findOne({ "store.name": storeName });
    if (existingUser) {
      return handleApiSuccess(res, 400, "Store name is not available");
    }
    return handleApiSuccess(res, 200, "Store name is available");
  } catch (error) {
    return handleApiError(res, 500, error.message || "Something went wrong");
  }
};

exports.signUp = async (req, res) => {
  const { data } = req.body;
  const { name, email, uid, store } = data;
  const requiredFields = ["name", "email", "uid", "store"];
  const missingFields = getMissingFields(data, requiredFields);
  if (missingFields.length > 0) {
    return handleApiError(
      res,
      400,
      `Required fields missing: ${missingFields.join(", ")}`
    );
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleApiError(res, 400, "User with this email already exists");
    }

    const newUser = new User({ name, email, uid, store });
    const catgeroySlug = `category-${createSlug("default")}`;
    const createdefaultCategory = new Category({
      user: newUser?._id,
      name: "Default",
      type: "Product",
      slug: catgeroySlug,
    });
    await createdefaultCategory.save();
    await newUser.save();
    return handleApiSuccess(
      res,
      200,
      "Hurray!, Your account has been registered with us"
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "something went wrong");
  }
};
