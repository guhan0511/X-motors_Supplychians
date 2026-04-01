// 模拟加盟商数据
let franchisees = [
  {
    id: 1,
    name: 'Pit Stop 3',
    contact: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta',
    risk: 'stable',
    nov: 8500000,
    dec: 9200000,
    jan: 8800000,
    feb: 9500000,
    mar_pred: 9800000
  },
  {
    id: 2,
    name: 'Subur Makmur Ban',
    contact: '081234567891',
    address: 'Jl. Thamrin No. 456, Jakarta',
    risk: 'growth',
    nov: 7200000,
    dec: 7800000,
    jan: 8100000,
    feb: 8500000,
    mar_pred: 8900000
  },
  {
    id: 3,
    name: 'Bengkel Pegasus',
    contact: '081234567892',
    address: 'Jl. Gatot Subroto No. 789, Jakarta',
    risk: 'volatile',
    nov: 6500000,
    dec: 7100000,
    jan: 6800000,
    feb: 7300000,
    mar_pred: 7600000
  }
];

// 生成下一个加盟商ID
let nextId = 4;

// 获取加盟商列表
const getFranchisees = (req, res) => {
  res.json(franchisees);
};

// 获取加盟商详情
const getFranchiseeById = (req, res) => {
  const { id } = req.params;
  
  // 查找加盟商
  const franchisee = franchisees.find(f => f.id === parseInt(id));
  
  if (!franchisee) {
    return res.status(404).json({ error: '加盟商不存在' });
  }
  
  res.json(franchisee);
};

// 创建加盟商
const createFranchisee = (req, res) => {
  const { name, contact, address, risk, nov, dec, jan, feb, mar_pred } = req.body;
  
  // 验证参数
  if (!name || !contact || !address) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 创建新加盟商
  const newFranchisee = {
    id: nextId++,
    name,
    contact,
    address,
    risk: risk || 'stable',
    nov: nov || 0,
    dec: dec || 0,
    jan: jan || 0,
    feb: feb || 0,
    mar_pred: mar_pred || 0
  };
  
  franchisees.push(newFranchisee);
  res.status(201).json(newFranchisee);
};

// 更新加盟商信息
const updateFranchisee = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // 查找加盟商
  const franchiseeIndex = franchisees.findIndex(f => f.id === parseInt(id));
  
  if (franchiseeIndex === -1) {
    return res.status(404).json({ error: '加盟商不存在' });
  }
  
  // 更新信息
  franchisees[franchiseeIndex] = { ...franchisees[franchiseeIndex], ...updates };
  res.json(franchisees[franchiseeIndex]);
};

module.exports = {
  getFranchisees,
  getFranchiseeById,
  createFranchisee,
  updateFranchisee
};