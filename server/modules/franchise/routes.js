const express = require('express');
const router = express.Router();
const franchiseController = require('./controller');
const { authenticate, authorize } = require('../../auth/middleware');

// 获取加盟商列表
router.get('/', authenticate, authorize(['admin', 'marketing']), franchiseController.getFranchisees);

// 获取加盟商详情
router.get('/:id', authenticate, authorize(['admin', 'marketing']), franchiseController.getFranchiseeById);

// 创建加盟商
router.post('/', authenticate, authorize(['admin']), franchiseController.createFranchisee);

// 更新加盟商信息
router.put('/:id', authenticate, authorize(['admin']), franchiseController.updateFranchisee);

module.exports = router;