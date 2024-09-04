const express = require('express');
const router = express.Router();
const metricController = require('../controller/metrics');
const {
    validateNewMetric,
    validateGetMetrics,
    checkValidationResult,
  } = require("../middleware/validation");

// Route để lấy các metrics theo loại với kiểm tra đầu vào và phân trang
router.get(
    "/metrics/:type",
    validateGetMetrics,
    checkValidationResult,
    metricController.getMetricsByType
  );
  
  // Route để thêm metric mới với kiểm tra đầu vào
  router.post(
    "/metrics",
    validateNewMetric,
    checkValidationResult,
    metricController.addMetric
  );
  
  // Route để lấy dữ liệu vẽ biểu đồ
  router.get(
    "/metrics/chart/:type",
    validateGetMetrics,
    checkValidationResult,
    metricController.getChartData
  );

module.exports = router;
