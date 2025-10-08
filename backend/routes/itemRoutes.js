// routes/itemRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Item = require("../models/item");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ----------------- Create Item -----------------
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      imageUrl: req.file ? `uploads/${req.file.filename}` : null, // ✅ fixed (no leading /)
      postedBy: req.user.id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Get All Items -----------------
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy", "name email");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Get Single Item -----------------
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("postedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Update Item -----------------
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    // Update fields
    item.title = req.body.title || item.title;
    item.description = req.body.description || item.description;
    item.category = req.body.category || item.category;
    item.status = req.body.status || item.status;
    item.location = req.body.location || item.location;

    if (req.file) {
      item.imageUrl = `uploads/${req.file.filename}`; // ✅ fixed (same as create)
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Delete Item -----------------
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (!item.postedBy) {
      return res.status(400).json({ message: "Item owner information missing" });
    }

    const userId = req.user.id || req.user._id;
    if (item.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Item.deleteOne({ _id: item._id });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ----------------- Mark Item as Found -----------------
router.put("/:id/mark-found", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    item.status = "Found";
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
