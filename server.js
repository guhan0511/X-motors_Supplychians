/**
 * X-Motors Supply Chain — Backend Server
 * ----------------------------------------
 * Lightweight Express + JSON-file storage.
 * Easy to extend: swap readJSON/writeJSON for any DB,
 * or connect Dingdanbao webhook, WhatsApp Bot, etc.
 *
 * Start: node server.js  (or: npm start)
 * Port:  3000  (override with PORT env var)
 */
 
'use strict';
 
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const cron    = require('node-cron');
 
const app      = express();
const PORT     = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
 
// ── Ensure data directory exists ────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
 
// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve the HTML dashboard
 
// ── JSON storage helpers ────────────────────────────────────────
function readJSON(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch (e) { console.error('readJSON error', file, e.message); return []; }
}
 
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}
 
function genId(prefix) {
  const d   = new Date();
  const dte = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `${prefix}-${dte}-${Date.now().toString(36).toUpperCase()}`;
}
 
// ── Invoice helpers ─────────────────────────────────────────────
const MONTHLY_TARGET = 8_500_000;   // IDR per store per month
const ANNUAL_TARGET  = 100_000_000; // IDR per store per year
 
function updateInvoiceStatuses(invoices) {
  const today = new Date(); today.setHours(0,0,0,0);
  return invoices.map(inv => {
    if (inv.status === 'paid') return inv;
    const due = new Date(inv.dueDate);
    if (due < today) return { ...inv, status: 'overdue' };
    return inv;
  });
}
 
function daysUntilDue(dueDateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((new Date(dueDateStr) - today) / 86_400_000);
}
 
// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════
 
// ── Health ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), version: '1.0.0' });
});
 
// ── Products ────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  res.json(readJSON('products.json'));
});
 
app.put('/api/products/:name', (req, res) => {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.name === decodeURIComponent(req.params.name));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body };
  writeJSON('products.json', products);
  res.json(products[idx]);
});
 
// ── Franchisees ─────────────────────────────────────────────────
app.get('/api/franchisees', (req, res) => {
  res.json(readJSON('franchisees.json'));
});
 
app.get('/api/franchisees/:name/performance', (req, res) => {
  const franchisees = readJSON('franchisees.json');
  const f = franchisees.find(x => x.name === decodeURIComponent(req.params.name));
  if (!f) return res.status(404).json({ error: 'Franchisee not found' });
 
  const months   = ['nov', 'dec', 'jan', 'feb'];
  const ytd      = months.reduce((sum, m) => sum + (f[m] || 0), 0);
  const latestMo = f.feb || f.jan || f.dec || f.nov || 0;
 
  // Invoices summary
  const invoices = readJSON('invoices.json').filter(i => i.franchisee === f.name);
  const outstandingInv = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
 
  res.json({
    ...f,
    monthlyTarget:        MONTHLY_TARGET,
    annualTarget:         ANNUAL_TARGET,
    ytd,
    latestMonth:          latestMo,
    monthlyAchievementPct: +(latestMo / MONTHLY_TARGET * 100).toFixed(1),
    annualAchievementPct:  +(ytd      / ANNUAL_TARGET  * 100).toFixed(1),
    outstandingInvoices:  outstandingInv,
    invoiceCount:         invoices.filter(i => i.status !== 'paid').length,
  });
});
 
// ── Orders ──────────────────────────────────────────────────────
app.get('/api/orders', (req, res) => {
  const { store, status } = req.query;
  let orders = readJSON('orders.json');
  if (store)  orders = orders.filter(o => o.store  === store);
  if (status) orders = orders.filter(o => o.status === status);
  res.json([...orders].reverse());
});
 
app.post('/api/orders', (req, res) => {
  const orders = readJSON('orders.json');
  const order  = {
    id:        genId('ORD'),
    ...req.body,
    status:    'pending',
    source:    req.body.source || 'manual',
    ts:        Date.now(),
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  writeJSON('orders.json', orders);
  res.status(201).json(order);
});
 
app.put('/api/orders/:id', (req, res) => {
  const orders = readJSON('orders.json');
  const idx    = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  orders[idx] = { ...orders[idx], ...req.body };
  writeJSON('orders.json', orders);
  res.json(orders[idx]);
});
 
// ── Invoices ────────────────────────────────────────────────────
app.get('/api/invoices', (req, res) => {
  const { franchisee, status } = req.query;
  let invoices = updateInvoiceStatuses(readJSON('invoices.json'));
  writeJSON('invoices.json', invoices); // persist status updates
  if (franchisee) invoices = invoices.filter(i => i.franchisee === franchisee);
  if (status)     invoices = invoices.filter(i => i.status     === status);
  res.json(invoices.map(i => ({ ...i, daysUntilDue: daysUntilDue(i.dueDate) })));
});
 
app.post('/api/invoices', (req, res) => {
  const invoices = readJSON('invoices.json');
  const { issueDate, paymentTerms = 30 } = req.body;
  const dueDate  = issueDate
    ? new Date(new Date(issueDate).getTime() + paymentTerms * 86_400_000).toISOString().split('T')[0]
    : req.body.dueDate;
  const invoice = {
    id:               genId('INV'),
    ...req.body,
    dueDate,
    paymentTerms,
    status:           'pending',
    reminderCount:    0,
    lastReminderDate: null,
    paidDate:         null,
    createdAt:        new Date().toISOString(),
  };
  invoices.push(invoice);
  writeJSON('invoices.json', invoices);
  res.status(201).json(invoice);
});
 
app.put('/api/invoices/:id', (req, res) => {
  const invoices = readJSON('invoices.json');
  const idx = invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });
  invoices[idx] = { ...invoices[idx], ...req.body };
  if (req.body.status === 'paid' && !invoices[idx].paidDate) {
    invoices[idx].paidDate = new Date().toISOString().split('T')[0];
  }
  writeJSON('invoices.json', invoices);
  res.json(invoices[idx]);
});
 
app.delete('/api/invoices/:id', (req, res) => {
  let invoices = readJSON('invoices.json');
  invoices = invoices.filter(i => i.id !== req.params.id);
  writeJSON('invoices.json', invoices);
  res.json({ success: true });
});
 
/**
 * POST /api/invoices/:id/remind
 * Marks invoice as reminder_sent, increments counter.
 * In production: trigger WhatsApp Bot / email here.
 */
app.post('/api/invoices/:id/remind', (req, res) => {
  const invoices = readJSON('invoices.json');
  const idx = invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });
  const inv = invoices[idx];
  if (inv.status === 'paid') return res.status(400).json({ error: 'Invoice already paid' });
 
  inv.reminderCount    = (inv.reminderCount || 0) + 1;
  inv.lastReminderDate = new Date().toISOString().split('T')[0];
  inv.status           = 'reminder_sent';
  writeJSON('invoices.json', invoices);
 
  // ── 🔌 Extension point: send WhatsApp / email ──────────────
  //  await sendWhatsApp(inv.franchisee, inv.amount, inv.dueDate);
  // ──────────────────────────────────────────────────────────
  console.log(`📱 [REMINDER #${inv.reminderCount}] → ${inv.franchisee} | ${inv.id} | Rp${inv.amount.toLocaleString()} | due ${inv.dueDate}`);
 
  res.json({ success: true, invoice: inv });
});
 
// ── Dashboard aggregate stats ────────────────────────────────────
app.get('/api/dashboard/stats', (req, res) => {
  const orders   = readJSON('orders.json');
  const invoices = updateInvoiceStatuses(readJSON('invoices.json'));
  const products = readJSON('products.json');
 
  const today = new Date(); today.setHours(0,0,0,0);
 
  const pendingOrders     = orders.filter(o => o.status === 'pending').length;
  const overdueInvoices   = invoices.filter(i => i.status === 'overdue').length;
  const dueIn3Days        = invoices.filter(i => {
    if (i.status === 'paid') return false;
    const d = daysUntilDue(i.dueDate);
    return d >= 0 && d <= 3;
  }).length;
  const outstandingAmount = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const lowStockProducts  = products.filter(p => (p.klg||0)+(p.pik2||0)+(p.ho||0) === 0).length;
 
  res.json({
    pendingOrders,
    overdueInvoices,
    dueIn3Days,
    outstandingAmount,
    totalProducts:    products.length,
    lowStockProducts,
  });
});
 
// ── Webhook entry point (Dingdanbao / 订单宝) ────────────────────
/**
 * POST /api/webhook/orders
 * Accepts Dingdanbao new-order push.
 * Configure in 订单宝 → 设置 → 开放接口 → Webhook URL:
 *   http://your-server/api/webhook/orders
 */
app.post('/api/webhook/orders', (req, res) => {
  try {
    const body   = req.body;
    const orders = readJSON('orders.json');
 
    // Normalise Dingdanbao payload — adjust field names to match their API
    const order = {
      id:        body.order_id  || genId('WH'),
      orderno:   body.order_no  || body.order_id,
      product:   body.product_name || body.sku_name,
      qty:       parseInt(body.qty || body.quantity) || 1,
      amount:    body.amount || body.total_price || '',
      date:      body.order_date || new Date().toISOString().split('T')[0],
      store:     body.store_name || body.franchisee,
      note:      body.remark || '',
      status:    'pending',
      source:    'webhook',
      ts:        Date.now(),
      createdAt: new Date().toISOString(),
    };
 
    orders.push(order);
    writeJSON('orders.json', orders);
    console.log(`📦 Webhook order received: ${order.orderno} | ${order.store} | ${order.product} ×${order.qty}`);
    res.json({ success: true, id: order.id });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(400).json({ error: 'Invalid payload' });
  }
});
 
// ════════════════════════════════════════════════════════════════
// CRON JOBS
// ════════════════════════════════════════════════════════════════
 
/**
 * Daily 09:00 WIB — auto-check invoice statuses and send reminders
 * for invoices due in ≤3 days (first auto-reminder only).
 */
cron.schedule('0 9 * * *', () => {
  console.log('\n⏰ [CRON] Daily invoice check...');
  const invoices = readJSON('invoices.json');
  let changed = false;
 
  invoices.forEach(inv => {
    if (inv.status === 'paid') return;
    const days = daysUntilDue(inv.dueDate);
 
    if (days < 0 && inv.status !== 'overdue') {
      inv.status = 'overdue';
      changed = true;
      console.log(`  ⚠️  OVERDUE: ${inv.franchisee} | ${inv.id} | ${Math.abs(days)} days past due`);
      // 🔌 Extension: sendWhatsApp(inv.franchisee, 'overdue', inv);
    } else if (days <= 3 && days >= 0 && inv.reminderCount === 0) {
      inv.status           = 'reminder_sent';
      inv.reminderCount    = 1;
      inv.lastReminderDate = new Date().toISOString().split('T')[0];
      changed = true;
      console.log(`  📱 AUTO-REMIND: ${inv.franchisee} | ${inv.id} | due in ${days} day(s)`);
      // 🔌 Extension: sendWhatsApp(inv.franchisee, 'reminder', inv);
    }
  });
 
  if (changed) writeJSON('invoices.json', invoices);
  console.log('  ✓ Invoice check complete\n');
}, { timezone: 'Asia/Jakarta' });
 
// ════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   X-Motors Supply Chain Backend  v1.0.0          ║
╠══════════════════════════════════════════════════╣
║  http://localhost:${PORT}                           ║
║  Data: ${path.relative(process.cwd(), DATA_DIR).padEnd(42)}║
╠══════════════════════════════════════════════════╣
║  API Endpoints:                                  ║
║  GET  /api/health                                ║
║  GET  /api/products                              ║
║  GET  /api/franchisees                           ║
║  GET  /api/franchisees/:name/performance         ║
║  GET  /api/orders         POST /api/orders       ║
║  PUT  /api/orders/:id                            ║
║  GET  /api/invoices       POST /api/invoices     ║
║  PUT  /api/invoices/:id   DELETE /api/invoices   ║
║  POST /api/invoices/:id/remind                   ║
║  POST /api/webhook/orders  (Dingdanbao hook)     ║
║  GET  /api/dashboard/stats                       ║
╚══════════════════════════════════════════════════╝
`);
});