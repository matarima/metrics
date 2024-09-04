const { body, query, param, validationResult } = require("express-validator");
const moment = require("moment");

// Kiểm tra loại metric và đơn vị hợp lệ
const isValidMetricType = (type) => ["Distance", "Temperature"].includes(type);

const isValidUnitForType = (unit, type) => {
  const validUnits = {
    Distance: ["Meter", "Centimeter", "Inch", "Feet", "Yard"],
    Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  };
  return validUnits[type] && validUnits[type].includes(unit);
};

// Middleware kiểm tra đầu vào cho thêm chỉ số mới
const validateNewMetric = [
  body("userId")
    .isString()
    .withMessage("userId phải là chuỗi.")
    .notEmpty()
    .withMessage("userId không được để trống."),
  body("type")
    .custom((value) => isValidMetricType(value))
    .withMessage(
      "Loại chỉ số không hợp lệ, chỉ chấp nhận Distance hoặc Temperature."
    ),
  body("value")
    .isFloat({ gt: 0 })
    .withMessage("Giá trị của chỉ số phải là số và lớn hơn 0."),
  body("unit")
    .custom((value, { req }) => isValidUnitForType(value, req.body.type))
    .withMessage(
      (_, { req }) => `Đơn vị không hợp lệ cho loại chỉ số ${req.body.type}.`
    ),
  body("date")
    .optional()
    .custom((value) => moment(value, moment.ISO_8601, true).isValid())
    .withMessage("Ngày không hợp lệ, định dạng phải là ISO 8601."),
];

// Middleware kiểm tra đầu vào cho các truy vấn API khác
const validateGetMetrics = [
  query("userId")
    .isString()
    .withMessage("userId phải là chuỗi.")
    .notEmpty()
    .withMessage("userId không được để trống."),
  param("type")
    .custom((value) => isValidMetricType(value))
    .withMessage(
      "Loại chỉ số không hợp lệ, chỉ chấp nhận Distance hoặc Temperature."
    ),
  query("unit")
    .optional()
    .custom((value, { req }) => isValidUnitForType(value, req.params.type))
    .withMessage(
      (_, { req }) => `Đơn vị không hợp lệ cho loại chỉ số ${req.params.type}.`
    ),
];

// Hàm kiểm tra kết quả từ express-validator
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateNewMetric,
  validateGetMetrics,
  checkValidationResult,
};
