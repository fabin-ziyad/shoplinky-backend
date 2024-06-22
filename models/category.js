const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Content", "Product"], required: true },
    slug: { type: String },
    isActive: { type: Boolean, default: true },
    items: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
