const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

// Send a message
router.post("/", auth, async (req, res) => {
  const { itemId, recipientId, text } = req.body;
  if (!itemId || !recipientId || !text) return res.status(400).json({ message: "All fields required" });

  try {
    const message = new Message({
      item: itemId,
      sender: req.user.id,
      recipient: recipientId,
      text,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get inbox messages for logged-in user
router.get("/inbox", auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .populate("item", "title");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get sent messages for logged-in user
router.get("/sent", auth, async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate("recipient", "name email")
      .populate("item", "title");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
