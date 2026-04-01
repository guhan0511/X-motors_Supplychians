// 模拟AI预测数据
const forecastData = [
  {
    product: '机油',
    month: '2026-03',
    forecast: 1200,
    confidence: 0.85,
    factors: {
      historical: 0.6,
      weather: 0.15,
      holidays: 0.1,
      other: 0.15
    }
  },
  {
    product: '轮胎',
    month: '2026-03',
    forecast: 850,
    confidence: 0.78,
    factors: {
      historical: 0.55,
      weather: 0.2,
      holidays: 0.1,
      other: 0.15
    }
  },
  {
    product: '刹车片',
    month: '2026-03',
    forecast: 650,
    confidence: 0.82,
    factors: {
      historical: 0.65,
      weather: 0.1,
      holidays: 0.1,
      other: 0.15
    }
  },
  {
    product: '机油',
    month: '2026-04',
    forecast: 1150,
    confidence: 0.8,
    factors: {
      historical: 0.55,
      weather: 0.2,
      holidays: 0.1,
      other: 0.15
    }
  },
  {
    product: '轮胎',
    month: '2026-04',
    forecast: 900,
    confidence: 0.75,
    factors: {
      historical: 0.5,
      weather: 0.25,
      holidays: 0.1,
      other: 0.15
    }
  },
  {
    product: '刹车片',
    month: '2026-04',
    forecast: 700,
    confidence: 0.78,
    factors: {
      historical: 0.6,
      weather: 0.15,
      holidays: 0.1,
      other: 0.15
    }
  }
];

// 模拟历史销售数据
const historicalSales = [
  { month: '2025-11',机油: 1000, 轮胎: 700, 刹车片: 500 },
  { month: '2025-12',机油: 1100, 轮胎: 750, 刹车片: 550 },
  { month: '2026-01',机油: 1150, 轮胎: 800, 刹车片: 600 },
  { month: '2026-02',机油: 1200, 轮胎: 850, 刹车片: 650 }
];

// 获取AI预测数据
const getForecast = (req, res) => {
  const { product, months } = req.query;
  
  let filteredData = forecastData;
  
  if (product) {
    filteredData = filteredData.filter(item => item.product === product);
  }
  
  if (months) {
    const limit = parseInt(months);
    if (limit > 0) {
      // 按月份分组并限制数量
      const monthMap = {};
      filteredData.forEach(item => {
        if (!monthMap[item.month]) {
          monthMap[item.month] = [];
        }
        monthMap[item.month].push(item);
      });
      
      const sortedMonths = Object.keys(monthMap).sort().slice(0, limit);
      filteredData = sortedMonths.flatMap(month => monthMap[month]);
    }
  }
  
  res.json(filteredData);
};

// 检测异常
const detectAnomalies = (req, res) => {
  const { product } = req.query;
  
  if (!product) {
    return res.status(400).json({ error: '缺少产品参数' });
  }
  
  // 提取指定产品的历史销售数据
  const productSales = historicalSales.map(item => item[product]);
  
  if (!productSales.length) {
    return res.json({ product, anomalies: [] });
  }
  
  // 计算均值和标准差
  const mean = productSales.reduce((sum, val) => sum + val, 0) / productSales.length;
  const stdDev = Math.sqrt(
    productSales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / productSales.length
  );
  
  // 检测异常值（超过2个标准差）
  const anomalies = historicalSales.filter((item, index) => {
    const value = item[product];
    return Math.abs(value - mean) > 2 * stdDev;
  }).map(item => ({
    month: item.month,
    value: item[product],
    deviation: ((item[product] - mean) / mean * 100).toFixed(2) + '%'
  }));
  
  res.json({
    product,
    mean: mean.toFixed(2),
    stdDev: stdDev.toFixed(2),
    anomalies
  });
};

// 获取智能建议
const getRecommendations = (req, res) => {
  const recommendations = [
    {
      id: 1,
      type: 'inventory',
      title: '库存预警',
      description: '机油库存低于安全水平，建议立即补货',
      priority: 'high',
      action: '联系供应商紧急补货'
    },
    {
      id: 2,
      type: 'sales',
      title: '销售趋势',
      description: '轮胎销售呈上升趋势，建议增加库存',
      priority: 'medium',
      action: '调整采购计划'
    },
    {
      id: 3,
      type: 'franchise',
      title: '加盟商绩效',
      description: 'Pit Stop 3 连续3个月达标，建议给予奖励',
      priority: 'low',
      action: '发送奖励通知'
    },
    {
      id: 4,
      type: 'logistics',
      title: '物流延迟',
      description: '多个订单物流延迟，建议跟进',
      priority: 'high',
      action: '联系物流公司查询状态'
    }
  ];
  
  res.json(recommendations);
};

module.exports = {
  getForecast,
  detectAnomalies,
  getRecommendations
};