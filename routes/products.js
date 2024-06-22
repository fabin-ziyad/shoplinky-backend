const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const product_controller = require("../controllers/productController");

router.post(
  "/create",
  upload.single("image"),
  product_controller.createProduct
);
// router.post(
//   "/update/:id",
//   upload.single("image"),
//   product_controller.editProduct
// );
router.post("/toggle/:slug", product_controller.toggleStatus);
router.post("/delete/:slug", product_controller.deleteProduct);
router.get("/", product_controller.getAllProduct);
// router.get("/:id", product_controller.getProductById);
router.get("/:slug", product_controller.getProductBySlug);
router.post("/update/:slug",product_controller.editProduct)
router.post("/get-by-type", product_controller.getByType);

module.exports = router;
