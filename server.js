const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// استيراد مودل المستخدم
const User = require("./models/User"); 

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// متغير حفظ حالة الصيانة (مهم يكون في الأعلى)
let maintenanceActive = false;

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("💜 [Database]: The Purple Core is Connected! 🔮"))
  .catch((err) => {
    console.error("❌ [Error]: Portal connection failed:", err.message);
    process.exit(1);
  });

// --- Routes ---
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// 1. مسار جلب كل المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 2. مسار التعديل (الاسم + النقاط) - الآن صار حقيقي
// ابحثي عن هذا المسار في server.js وعدليه ليكون هكذا:
app.put('/api/users/:id', async (req, res) => {
  try {
    // التعديل هنا: أضفنا username لكي يستقبله السيرفر
    const { username, totalScore } = req.body; 
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { username, totalScore }, // تحديث الحقلين معاً في قاعدة البيانات
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Hero not found!" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating database" });
  }
});

// 3. مسار الحذف (Delete) - أضفته لك عشان يشتغل الزر الأحمر
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "Hero removed from database" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// 4. مسارات وضع الصيانة (نقلتها فوق الـ listen عشان تشتغل)
app.post('/api/maintenance', (req, res) => {
  maintenanceActive = req.body.status;
  console.log("🛠️ Maintenance Status Updated:", maintenanceActive);
  res.json({ success: true, status: maintenanceActive });
});

app.get('/api/maintenance-status', (req, res) => {
  res.json({ isMaintenanceMode: maintenanceActive }); // خليته isMaintenanceMode عشان يطابق الـ Frontend حقك
});

// --- الصفحة الرئيسية ---
app.get("/", (req, res) => {
  res.send("<h1 style='color: #8A2BE2; font-family: sans-serif;'>💜 Password Heroes API is Alive! 🔮</h1>");
});

// مسار 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "🕵️ Path leads to nowhere!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 [Server]: Flying high on http://localhost:${PORT}`);
  console.log(`✨ [Ready]: The Purple Hero Portal is open! 💜`);
});