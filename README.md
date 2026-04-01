# X-Motors 供应链看板系统

## 项目简介

X-Motors 供应链看板系统是一个现代化的供应链管理平台，旨在帮助企业实现供应链的可视化管理、智能分析和高效协同。系统集成了前端看板、后端API、AI分析引擎和WhatsApp Bot，为企业提供全方位的供应链管理解决方案。

## 技术栈

### 前端
- HTML5, CSS3, JavaScript
- Chart.js (数据可视化)
- 响应式设计

### 后端
- Node.js + Express
- MongoDB (数据库)
- Redis (缓存)
- JWT (认证)

### AI分析
- 需求预测模型
- 异常检测算法
- 智能建议系统

### 集成
- WhatsApp Bot
- 外部API (天气、节假日)

## 系统架构

系统采用分层架构设计：

1. **前端层**：供应链看板、多角色权限控制
2. **应用层**：后端API服务、AI分析引擎
3. **数据层**：数据库、缓存
4. **外部服务**：WhatsApp Bot、第三方API

详细架构设计请参考 `架构设计文档.md`。

## 功能模块

### 核心功能
- **数据总览**：实时KPI指标、业务概览
- **库存管理**：库存状态、预警机制
- **采购申请**：申请提交、审批流程
- **物流追踪**：实时物流状态、异常处理
- **销售分析**：销售趋势、绩效分析
- **加盟商管理**：绩效追踪、目标达成
- **发票管理**：发票创建、账期追踪
- **AI预测**：需求预测、智能分析
- **业务建议**：智能建议、优化方案
- **WhatsApp Bot**：订单处理、库存查询

### 权限体系
- **管理员**：所有功能权限
- **运营**：订单、物流、库存管理
- **市场**：销售分析、加盟商管理
- **加盟商**：个人销售、采购申请

## 快速开始

### 环境要求
- Node.js 18.x+
- MongoDB 6.x+
- Redis 7.x+ (可选)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd x-motors-supply-chain
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env` 文件：
   ```
   # 服务器配置
   PORT=8000
   
   # 数据库配置
   MONGODB_URI=mongodb://localhost:27017/x-motors-supply-chain
   
   # JWT配置
   JWT_SECRET=your-secret-key
   
   # Redis配置 (可选)
   REDIS_URL=redis://localhost:6379
   ```

4. **启动服务器**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

5. **访问系统**
   - 前端：打开 `X-Motors供应链看板v3-完整版.html`
   - API文档：http://localhost:8000

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌

### 订单接口
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id` - 更新订单状态
- `GET /api/orders/:id` - 获取订单详情

### 库存接口
- `GET /api/inventory` - 获取库存列表
- `PUT /api/inventory/:id` - 更新库存状态

### 物流接口
- `GET /api/logistics` - 获取物流列表
- `PUT /api/logistics/:id` - 更新物流状态

### 销售接口
- `GET /api/sales` - 获取销售数据

### 加盟商接口
- `GET /api/franchise` - 获取加盟商列表
- `GET /api/franchise/:id` - 获取加盟商详情

### 发票接口
- `GET /api/invoices` - 获取发票列表
- `POST /api/invoices` - 创建发票
- `PUT /api/invoices/:id` - 更新发票状态
- `GET /api/invoices/:id` - 获取发票详情

### AI接口
- `GET /api/ai/forecast` - 获取AI预测数据
- `GET /api/ai/anomalies` - 检测异常
- `GET /api/ai/recommendations` - 获取智能建议

### WhatsApp接口
- `POST /api/whatsapp/webhook` - WhatsApp消息接收

## 测试账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 运营 | ops | ops123 |
| 市场 | marketing | marketing123 |
| 加盟商 | Pit Stop 3 | franchise123 |

## 部署指南

### 本地开发
1. 启动 MongoDB：`mongod`
2. 启动 Redis (可选)：`redis-server`
3. 启动应用：`npm run dev`

### 生产部署
1. 配置生产环境变量
2. 构建前端资源
3. 使用 PM2 管理进程：`pm2 start server.js`
4. 配置 Nginx 反向代理

## 项目结构

```
├── server/                  # 后端代码
│   ├── auth/                # 认证模块
│   ├── modules/             # 功能模块
│   │   ├── orders/          # 订单模块
│   │   ├── inventory/       # 库存模块
│   │   ├── logistics/       # 物流模块
│   │   ├── sales/           # 销售模块
│   │   ├── franchise/       # 加盟商模块
│   │   ├── invoices/        # 发票模块
│   │   ├── ai/              # AI模块
│   │   └── whatsapp/        # WhatsApp模块
├── X-Motors供应链看板v3-完整版.html  # 前端应用
├── package.json             # 项目配置
├── server.js                # 服务器入口
└── README.md                # 项目说明
```

## 维护与支持

### 日志管理
- 系统日志：`logs/` 目录
- API请求日志：控制台输出

### 故障排查
1. 检查数据库连接
2. 检查Redis连接 (可选)
3. 查看服务器日志
4. 验证API接口响应

### 技术支持
- 文档：`架构设计文档.md`
- 联系邮箱：support@x-motors.com

## 版本历史

- v1.0.0 (2026-04-01)：初始版本
  - 核心功能实现
  - 基础架构搭建
  - 模拟数据支持

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request，共同改进系统功能。