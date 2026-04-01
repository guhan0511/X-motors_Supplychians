const express = require('express');
const router = express.Router();
const aiController = require('./controller');
const { authenticate, authorize } = require('../../auth/middleware');

// 获取AI预测数据
router.get('/forecast', authenticate, authorize(['admin', 'marketing']), aiController.getForecast);

// 检测异常
router.get('/anomalies', authenticate, authorize(['admin', 'marketing']), aiController.detectAnomalies);

// 获取智能建议
router.get('/recommendations', authenticate, authorize(['admin', 'marketing', 'ops']), aiController.getRecommendations);

module.exports = router;