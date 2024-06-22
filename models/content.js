const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    type: { type: String, require: true },
    slug: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    user: { type: Schema.Types.ObjectId, ref: "User" },
    category:[{ type: Schema.Types.ObjectId, ref: "Category" }]
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
