const express = require('express');
const router = express.Router();
const invoiceController = require('./controller');
const { authenticate, authorize } = require('../../auth/middleware');

// 获取发票列表
router.get('/', authenticate, invoiceController.getInvoices);

// 创建发票
router.post('/', authenticate, authorize(['admin']), invoiceController.createInvoice);

// 更新发票状态
router.put('/:id', authenticate, invoiceController.updateInvoice);

// 获取发票详情
router.get('/:id', authenticate, invoiceController.getInvoiceById);

module.exports = router;