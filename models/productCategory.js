const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "Active" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const ProductCategory = mongoose.model(
  "ProductCategory",
  ProductCategorySchema
);

module.exports = ProductCategory;
