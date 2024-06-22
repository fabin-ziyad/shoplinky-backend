const express = require("express");
const router = express.Router();
const multer = require("multer");
const collectionController = require("../controllers/collectionController");

router.get("/", collectionController.getCollections);
router.get("/:slug", collectionController.getCollectionsBySlug);
router.post("/create", collectionController.createCollection);
router.post("/toggle/:id", collectionController.toggleStatus);
router.post("/removeProduct/:slug", collectionController.removeProductFromCollection);
router.put("/update/:id", collectionController.updateCollections);
router.delete("/delete/:id", collectionController.deleteCollections);
router.post("/addProducts/:slug", collectionController.addProductToCollection);


module.exports = router;
