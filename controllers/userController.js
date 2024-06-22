const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Products = require("../models/product");
const Contents = require("../models/content");
const Categories = require("../models/category");
const Collections = require("../models/collection");
const {
  handleApiError,
  handleApiSuccess,
} = require("../utils/responseHandler");

exports.signUp = async (req, res) => {
  const { data } = req.body;
  const { name, email, uid, store } = data;

  if (!name || !email || !uid || !store || !store.name) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: name, email, uid, and store name.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = new User({ name, email, uid, store });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // const userCredential = await signInWithEmailAndPassword(email, password);
    // const user = userCredential.user;
    // const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET);
    // res.json({ token: token });
  } catch (error) {
    if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      res.status(401).json({ message: "Incorrect email or password" });
    } else if (error.code === "auth/too-many-requests") {
      res
        .status(429)
        .json({ message: "Too many attempts. Please try again later." });
    } else {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
};

exports.getUserById = async (req, res) => {
  const { email } = req.body;
  try {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: findUser,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "something went wrong",
    });
  }
};

exports.getUserByMail = async (req, res) => {
  console.log(req.user)
  try {
    console.log(req.body)
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return handleApiError(res, 400, "User not found");
    }
    return handleApiSuccess(
      res,
      200,
      "User data fetched successfully",
      findUser
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "Something went wrong");
  }
};

exports.checkStoreName = async (req, res) => {
  const { storeName } = req.body;

  if (!storeName) {
    return res.status(400).json({
      success: false,
      message: "Store name is required",
    });
  }

  try {
    const existingUser = await User.findOne({ "store.name": storeName });
    console.log(existingUser);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Store name is already taken",
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: "Store name is available",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.getMyData = async (req, res) => {
  console.log(req.user);
  const { email } = req.user;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return handleApiError(res, 400, "User not found");
    }
    const findMyProducts = (await Products.find({ user: findUser?._id })) || [];
    const findMyContents = (await Contents.find({ user: findUser?._id })) || [];
    const findMyCollections =
      (await Collections.find({ user: findUser?._id })) || [];
    const findMyCategories =
      (await Categories.find({ user: findUser?._id })) || [];
    const overallData = {
      products: findMyProducts,
      contents: findMyContents,
      collections: findMyCollections,
      categories: findMyCategories,
    };
    return handleApiSuccess(
      res,
      200,
      "overall data fetched sucessfully",
      overallData
    );
  } catch (error) {
    return handleApiError(res, 500, error.message || "something went wrong");
  }
};
