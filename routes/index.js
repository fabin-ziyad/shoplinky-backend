var express = require("express");
var router = express.Router();
const uploadController = require("../controllers/uploadController");
const multer = require("multer");
const { AWS } = require("../config/AWS/S3");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });
const indexController=require("../controllers/indexController")
router.post(
  "/upload",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "collection", maxCount: 1 },
    { name: "product", maxCount: 1 },
    { name: "content", maxCount: 1 },
  ]),
  uploadController.uploadImage
);
router.post("/check-store-name", indexController.checkStoreName)
router.post("/createUser",indexController.signUp)
router.get("/status", (req, res) => {
  res.send("Welcome to shoplinky")
})
module.exports = router;
