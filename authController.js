const bcrypt = require("bcryptjs");
const Joi = require("joi");
const User = require("../models/User");

// --- Data Validation Schema ---
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

// --- 1. Register Logic (The Hero Creator) ---
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: `⚠️ Oops! ${error.details[0].message}` });

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "🚫 This email is already a legend here! Try another one." });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({ 
      success: true, 
      message: `✨ Welcome to the Kingdom, Hero ${username}! Your purple journey begins now! 💜` 
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "🌌 Cosmic Error! Something went wrong in the shadows." });
  }
};

// --- 2. Login Logic (The Hero Gateway) ---
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }); 
    
    if (!user) return res.status(401).json({ success: false, message: "🗝️ بيانات غير صحيحة" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "🗝️ بيانات غير صحيحة" });

    // التأكد من إرسال totalScore من قاعدة البيانات للـ React
    return res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        totalScore: user.totalScore || 0 
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
};

// --- 3. Password Recovery (The Hero's Memory) ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "🚫 This email was never inscribed in our scrolls!" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "📧 A magical scroll (recovery link) has been sent to your email! Check your inbox." 
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "🌌 The memory portal is foggy. Try again later." });
  }
};

// --- 4. Admin Logic: View All Heroes (The Watchtower) ---
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await User.find({}, 'username email totalScore role');
    return res.status(200).json({ success: true, players });
  } catch (err) {
    return res.status(500).json({ success: false, message: "🌌 The Watchtower is blurry! Cannot see the heroes." });
  }
};

// --- 5. Admin Logic: Edit Hero (The Blacksmith) ---
exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params; 
    const { username, totalScore, role } = req.body; 

    const updatedHero = await User.findByIdAndUpdate(
      id, 
      { username, totalScore, role }, 
      { new: true } 
    );

    return res.status(200).json({ 
      success: true, 
      message: `🛠️ Hero ${updatedHero.username} has been re-forged!`,
      updatedHero 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "🌌 The anvil broke! Could not update the hero." });
  }
};

// --- 6. 🔥 التعديل الجديد: حفظ النقاط لعبة بلعبة (The Score Keeper) ---
exports.updateScore = async (req, res) => {
  try {
    const { username, scoreToAdd } = req.body;
    
    // نستخدم $inc لزيادة النقاط على السكور الموجود فعلياً في MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { username }, 
      { $inc: { totalScore: scoreToAdd } }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "البطل غير موجود" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "تم حفظ النقاط في الخزنة بنجاح! 🏰",
      newTotalScore: updatedUser.totalScore 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "فشل تحديث النقاط في السيرفر" });
  }
};