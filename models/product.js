const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    type: { type: Schema.Types.ObjectId, ref: "Type" },
    stock: { type: Number },
    isActive: { type: Boolean, default: true },
    creation: { type: Date, default: Date.now },
    link: { type: String },
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    contents: [{ type: Schema.Types.ObjectId, ref: "Content" }],
    image: { type: String, required: true },
    slug: { type: String },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
