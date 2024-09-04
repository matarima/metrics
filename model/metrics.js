const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["Distance", "Temperature"], required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Tạo model Metric dựa trên schema
const Metric = mongoose.model("Metric", metricSchema);

module.exports = Metric;
