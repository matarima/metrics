const moment = require("moment"); // Thư viện xử lý ngày giờ
const Metric = require("../model/metrics");
const convertUnit = require("../utils/convertUnit");

// Hàm lấy tất cả các chỉ số theo loại
const getMetricsByType = async (req, res) => {
  const type = req.params.type;
  const { userId, unit, page = 1, limit = 10 } = req.query;

  // Kiểm tra page và limit hợp lệ
  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res
      .status(400)
      .json({ message: "Giá trị của page hoặc limit không hợp lệ." });
  }

  try {
    // Phân trang: Sử dụng `page` và `limit`
    const metrics = await Metric.find({ type, userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    if (metrics.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có dữ liệu trên trang này" });
    }

    const resultMetrics = metrics.map((metric) => {
      let convertedValue = metric.value;
      let convertedUnit = metric.unit;

      if (unit && unit !== metric.unit) {
        convertedValue = convertUnit(metric.value, metric.unit, unit, type);
        convertedUnit = unit;
      }

      return {
        ...metric._doc,
        value: convertedValue,
        unit: convertedUnit,
      };
    });

    // Đếm tổng số chỉ số để trả về tổng số trang
    const count = await Metric.countDocuments({ type, userId });

    res.status(200).json({
      metrics: resultMetrics,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi truy xuất dữ liệu.",
      error: error.message,
    });
  }
};

// Hàm thêm chỉ số mới
const addMetric = async (req, res) => {
  const { userId, type, value, unit, date } = req.body;

  try {
    // Tạo một instance mới của Metric và lưu vào MongoDB
    const newMetric = new Metric({
      userId,
      type,
      value,
      unit,
      date: date || Date.now(),
    });
    const savedMetric = await newMetric.save(); // Lưu metric mới vào MongoDB

    res.status(201).json(savedMetric);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi thêm chỉ số mới.",
      error: error.message,
    });
  }
};

// Hàm lấy dữ liệu để vẽ biểu đồ
const getChartData = async (req, res) => {
  const type = req.params.type;
  const { userId, unit, period } = req.query;

  // Xác định ngày bắt đầu dựa trên khoảng thời gian
  let startDate = new Date();

  if (period === "1month") {
    startDate.setMonth(startDate.getMonth() - 1); // Nếu khoảng thời gian là 1 tháng
  } else if (period === "2months") {
    startDate.setMonth(startDate.getMonth() - 2); // Nếu khoảng thời gian là 2 tháng
  }

  try {
    // Tìm các metric theo userId, loại và khoảng thời gian
    const filteredMetrics = await Metric.find({
      type,
      userId,
      date: { $gte: startDate }, // Chỉ lấy dữ liệu từ ngày bắt đầu đến hiện tại
    });

    // Lấy chỉ số mới nhất trong mỗi ngày
    let latestMetricsPerDay = {};
    filteredMetrics.forEach((metric) => {
      const dateKey = moment(metric.date).format("YYYY-MM-DD");
      if (
        !latestMetricsPerDay[dateKey] ||
        new Date(metric.date) > new Date(latestMetricsPerDay[dateKey].date)
      ) {
        latestMetricsPerDay[dateKey] = metric;
      }
    });

    // Chuyển đổi đơn vị nếu cần
    let resultMetrics = Object.values(latestMetricsPerDay).map((metric) => {
      let convertedValue = metric.value;
      let convertedUnit = metric.unit;

      if (unit && unit !== metric.unit) {
        convertedValue = convertUnit(metric.value, metric.unit, unit, type);
        convertedUnit = unit;
      }

      return {
        ...metric._doc,
        value: convertedValue,
        unit: convertedUnit,
      };
    });

    res.status(200).json(resultMetrics);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi truy xuất dữ liệu biểu đồ.",
      error: error.message,
    });
  }
};

// Xuất các hàm để sử dụng trong router
module.exports = {
  getMetricsByType,
  addMetric,
  getChartData,
};
