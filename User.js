const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    // السكور الإجمالي للاعب
    totalScore: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ["PLAYER", "ADMIN"],
      default: "PLAYER"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);