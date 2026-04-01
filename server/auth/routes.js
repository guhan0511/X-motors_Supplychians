const express = require('express');
const router = express.Router();
const authController = require('./controller');

// 登录路由
router.post('/login', authController.login);

// 刷新令牌路由
router.post('/refresh', authController.refreshToken);

module.exports = router;