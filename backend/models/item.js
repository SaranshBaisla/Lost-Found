const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  status: { type: String, default: "Lost" }, // Lost, Found, Returned
  location: String,
  date: { type: Date, default: Date.now },
  imageUrl: {
    url: String,
    filename : String
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Item", itemSchema);
