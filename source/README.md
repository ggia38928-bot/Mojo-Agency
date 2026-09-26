# MarginGuard AI — Fullstack Architecture (NestJS + React Vite)

> **Hệ Thống Tự Trị Bảo Vệ P&L & Cắt Lỗ Shopee Ads Chuẩn 2026**  
> Dự án tham dự **Sea × OpenAI Codex Hackathon 2026**

---

## 📂 Cấu Trúc Mã Nguồn Hoàn Chỉnh

```
source/
├── backend/                       # 🟢 NestJS Enterprise Backend (Port 3001)
│   ├── src/
│   │   ├── common/
│   │   │   ├── constants/shopee-fees.constant.ts  # Phí 8%, 4.91%, 4% & ngưỡng rủi ro
│   │   │   └── enums/                             # RiskLevel, ActionCommand
│   │   ├── modules/
│   │   │   ├── pnl-engine/        # Hạt nhân tính toán tài chính Shopee 2026
│   │   │   ├── telemetry/         # Ingestion, Mock data, CSV Parser & Streaming
│   │   │   ├── risk-agent/        # Agent 2: Phân loại rủi ro (CRITICAL, WARNING, NORMAL)
│   │   │   ├── action-agent/      # Agent 3: Can thiệp tự trị (KILL, LOWER_50, MAINTAIN)
│   │   │   └── orchestrator/      # Điều phối luồng và cung cấp REST API
│   │   ├── app.module.ts
│   │   └── main.ts                # Swagger UI tại http://localhost:3001/docs
│   └── package.json
│
└── frontend/                      # 🔵 React + Vite + TypeScript Frontend (Port 5173)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx         # Thanh điều hướng, trạng thái Server, nút kích hoạt demo
    │   │   ├── KpiMetrics.tsx     # Thẻ KPI tài chính (Tổng tiền cắt lỗ, số chiến dịch bị KILL)
    │   │   ├── AgentPipelineVisualizer.tsx # Trực quan hóa quy trình 4 bước của Multi-Agent
    │   │   ├── SkuTable.tsx       # Ma trận P&L từng SKU (Doanh thu, CAC vs Biên gộp, Net P&L)
    │   │   ├── AuditFeed.tsx      # Ticker nhật ký hành động tự trị theo thời gian thực
    │   │   └── MegaSaleModal.tsx  # Hộp cát (Sandbox) giả lập bão đơn Mega Sale để test
    │   ├── api.ts                 # Kết nối API NestJS (có cơ chế fallback thông minh)
    │   ├── types.ts               # Data contract đồng bộ 100% với DTO NestJS
    │   ├── App.tsx
    │   └── index.css              # Dark Mode Fintech design system
    ├── index.html
    └── package.json
```

---

## 🚀 Hướng Dẫn Khởi Chạy Toàn Bộ Hệ Thống

### 1. Khởi chạy Backend (NestJS)
Mở cửa sổ Terminal thứ nhất:
```bash
cd source/backend

# Chạy kiểm thử tự động (13/13 Jest tests pass)
npm test

# Khởi chạy máy chủ Backend (Cổng 3001)
npm run start:dev
```
- **Tài liệu Swagger API:** [http://localhost:3001/docs](http://localhost:3001/docs)
- **Demo API Endpoint:** [http://localhost:3001/api/orchestrator/demo](http://localhost:3001/api/orchestrator/demo)

---

### 2. Khởi chạy Frontend (React + Vite)
Mở cửa sổ Terminal thứ hai:
```bash
cd source/frontend

# Khởi chạy giao diện Dashboard
npm run dev
```
- **Bảng điều khiển trực quan:** [http://localhost:5173](http://localhost:5173)

---

## 💡 Các Kịch Bản Trải Nghiệm Trên Giao Diện

1. **Chạy Demo (3 SKU chuẩn):**
   - Click nút **"Chạy Demo (3 SKU)"** trên thanh điều hướng.
   - Quan sát Agent 3 tự động kích hoạt **`KILL_CAMPAIGN`** đối với SKU `SKU-003` (Bộ Sạc Nhanh 20W) và cắt lỗ thành công **84.185 VNĐ**.
   - SKU `SKU-002` (Tai Nghe Bluetooth) bị biên mỏng 3.1% &rarr; tự động **`LOWER_BID_50`** từ 20.000đ xuống ~10.000đ.
   - SKU `SKU-001` (Ốp Lưng iPhone) an toàn &rarr; **`MAINTAIN`**.
2. **Nạp dữ liệu CSV (5 SKU):**
   - Click nút **"Nạp CSV (5 SKU)"** để đọc file `mock_shopee_orders.csv`.
3. **Test Bẫy Cắt Lỗ Mega Sale (Sandbox):**
   - Click nút **"Test Bẫy Cắt Lỗ"** màu đỏ để mở Modal giả lập.
   - Thay đổi chi phí quảng cáo (Ad Spend) hoặc doanh thu của SKU bất kỳ để xem hệ thống Multi-Agent tức thì phát hiện nguy cơ và ra lệnh tự trị.
