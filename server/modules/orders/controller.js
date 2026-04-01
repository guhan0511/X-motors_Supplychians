// 模拟订单数据
let orders = [
  {
    id: 1,
    store: 'Pit Stop 3',
    product: '机油',
    qty: 10,
    date: '2026-02-01',
    status: 'approved'
  },
  {
    id: 2,
    store: 'Subur Makmur Ban',
    product: '轮胎',
    qty: 5,
    date: '2026-02-02',
    status: 'pending'
  },
  {
    id: 3,
    store: 'Bengkel Pegasus',
    product: '刹车片',
    qty: 8,
    date: '2026-02-03',
    status: 'rejected'
  }
];

// 生成下一个订单ID
let nextId = 4;

// 获取订单列表
const getOrders = (req, res) => {
  let filteredOrders = orders;
  
  // 如果是加盟商，只返回自己的订单
  if (req.user.role === 'franchise') {
    filteredOrders = orders.filter(order => order.store === req.user.username);
  }
  
  res.json(filteredOrders);
};

// 创建订单
const createOrder = (req, res) => {
  const { store, product, qty, date } = req.body;
  
  // 验证参数
  if (!store || !product || !qty || !date) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 创建新订单
  const newOrder = {
    id: nextId++,
    store: req.user.role === 'franchise' ? req.user.username : store,
    product,
    qty,
    date,
    status: 'pending'
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
};

// 更新订单状态
const updateOrder = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // 验证状态
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }
  
  // 查找订单
  const orderIndex = orders.findIndex(order => order.id === parseInt(id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: '订单不存在' });
  }
  
  // 更新状态
  orders[orderIndex].status = status;
  res.json(orders[orderIndex]);
};

// 获取订单详情
const getOrderById = (req, res) => {
  const { id } = req.params;
  
  // 查找订单
  const order = orders.find(order => order.id === parseInt(id));
  
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  
  // 验证权限
  if (req.user.role === 'franchise' && order.store !== req.user.username) {
    return res.status(403).json({ error: '权限不足' });
  }
  
  res.json(order);
};

module.exports = {
  getOrders,
  createOrder,
  updateOrder,
  getOrderById
};