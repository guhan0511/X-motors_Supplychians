// 模拟发票数据
let invoices = [
  {
    id: 1,
    invoiceId: 'INV-2026-001',
    franchisee: 'Pit Stop 3',
    amount: 9100000,
    issueDate: '2026-02-01',
    dueDate: '2026-03-02',
    status: 'pending',
    notes: '货款周期：Net 30天'
  },
  {
    id: 2,
    invoiceId: 'INV-2026-002',
    franchisee: 'Subur Makmur Ban',
    amount: 15000000,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'overdue',
    notes: '货款周期：Net 30天'
  },
  {
    id: 3,
    invoiceId: 'INV-2026-003',
    franchisee: 'Bengkel Pegasus',
    amount: 7500000,
    issueDate: '2026-01-20',
    dueDate: '2026-02-20',
    status: 'paid',
    notes: '货款周期：Net 30天'
  }
];

// 生成下一个发票ID
let nextId = 4;

// 生成发票号码
const generateInvoiceId = () => {
  const year = new Date().getFullYear();
  const sequence = String(nextId).padStart(3, '0');
  return `INV-${year}-${sequence}`;
};

// 计算到期日
const calculateDueDate = (issueDate, terms) => {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + terms);
  return date.toISOString().split('T')[0];
};

// 获取发票列表
const getInvoices = (req, res) => {
  let filteredInvoices = invoices;
  
  // 如果是加盟商，只返回自己的发票
  if (req.user.role === 'franchise') {
    filteredInvoices = invoices.filter(invoice => invoice.franchisee === req.user.username);
  }
  
  res.json(filteredInvoices);
};

// 创建发票
const createInvoice = (req, res) => {
  const { franchisee, amount, issueDate, terms, notes } = req.body;
  
  // 验证参数
  if (!franchisee || !amount || !issueDate || !terms) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 计算到期日
  const dueDate = calculateDueDate(issueDate, terms);
  
  // 创建新发票
  const newInvoice = {
    id: nextId++,
    invoiceId: generateInvoiceId(),
    franchisee,
    amount,
    issueDate,
    dueDate,
    status: 'pending',
    notes: notes || ''
  };
  
  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
};

// 更新发票状态
const updateInvoice = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // 验证状态
  if (!status || !['pending', 'overdue', 'paid', 'reminder_sent'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }
  
  // 查找发票
  const invoiceIndex = invoices.findIndex(invoice => invoice.id === parseInt(id));
  
  if (invoiceIndex === -1) {
    return res.status(404).json({ error: '发票不存在' });
  }
  
  // 验证权限
  if (req.user.role === 'franchise' && invoices[invoiceIndex].franchisee !== req.user.username) {
    return res.status(403).json({ error: '权限不足' });
  }
  
  // 更新状态
  invoices[invoiceIndex].status = status;
  res.json(invoices[invoiceIndex]);
};

// 获取发票详情
const getInvoiceById = (req, res) => {
  const { id } = req.params;
  
  // 查找发票
  const invoice = invoices.find(invoice => invoice.id === parseInt(id));
  
  if (!invoice) {
    return res.status(404).json({ error: '发票不存在' });
  }
  
  // 验证权限
  if (req.user.role === 'franchise' && invoice.franchisee !== req.user.username) {
    return res.status(403).json({ error: '权限不足' });
  }
  
  res.json(invoice);
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  getInvoiceById
};