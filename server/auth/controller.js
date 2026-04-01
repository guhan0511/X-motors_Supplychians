const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: 2,
    username: 'ops',
    password: bcrypt.hashSync('ops123', 10),
    role: 'ops'
  },
  {
    id: 3,
    username: 'marketing',
    password: bcrypt.hashSync('marketing123', 10),
    role: 'marketing'
  },
  {
    id: 4,
    username: 'Pit Stop 3',
    password: bcrypt.hashSync('franchise123', 10),
    role: 'franchise',
    franchiseId: '1'
  }
];

// 登录控制器
const login = (req, res) => {
  const { username, password } = req.body;
  
  // 查找用户
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  // 验证密码
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, franchiseId: user.franchiseId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      franchiseId: user.franchiseId
    }
  });
};

// 刷新令牌控制器
const refreshToken = (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: '缺少令牌' });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    // 生成新令牌
    const newToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, franchiseId: user.franchiseId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token: newToken
    });
  } catch (error) {
    res.status(401).json({ error: '令牌无效' });
  }
};

module.exports = {
  login,
  refreshToken
};