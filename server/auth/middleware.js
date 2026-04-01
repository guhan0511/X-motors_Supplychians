const jwt = require('jsonwebtoken');

// 认证中间件
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '缺少认证令牌' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '令牌无效' });
  }
};

// 角色授权中间件
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};