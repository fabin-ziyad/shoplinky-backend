const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    store: {
      name: { type: String, required: true, default: "" },
      ratings: { type: String, required: false },
    },
    role: {
      type: String,
      enum: ["Creator", "Brand", "Affiliates", "Admin", "Fans"],
      default: "Creator",
    },

    profile: {
      type: Object,
      default: {},
    },
    socialLinks: [{ type: String, required: false }],
    interested: [{ type: String, required: false }],
    sex: { type: String, required: false, default: "Male" },
    dob: { type: String, required: false, default: "10-10-1999" },
    picture: { type: String, required: false },
    website: { type: String, required: false },
    bio: { type: String, required: false, default: "NA" },
    uid: { type: String },
    country: { type: String, required: false, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
