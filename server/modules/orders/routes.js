const express = require('express');
const router = express.Router();
const orderController = require('./controller');
const { authenticate, authorize } = require('../../auth/middleware');

// 获取订单列表
router.get('/', authenticate, orderController.getOrders);

// 创建订单
router.post('/', authenticate, orderController.createOrder);

// 更新订单状态
router.put('/:id', authenticate, authorize(['admin', 'ops']), orderController.updateOrder);

// 获取订单详情
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;