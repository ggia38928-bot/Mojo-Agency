# 🤖 HƯỚNG DẪN TRIỂN KHAI SUB-AGENT "MOJO AGENCY"
## MarginGuard AI - Real-Time Autonomous P&L & Ad-Spend Safeguard for Shopee Sellers
### Sea x OpenAI Codex Hackathon 2026

---

### 📋 Bước 1: Tải & Giải nén Tệp vào Thư mục Local
1. Tải tệp `MarginGuard_AI_Missing_Files-v2.zip` từ bảng Studio ở góc phải màn hình.
2. Giải nén toàn bộ tệp vào thư mục dự án `Mojo-Agency` trên máy tính của bạn (đường dẫn: `D:\AI_Agent\30_SUBAGENTS\MOJO AGENCY`).

---

### 🛠️ Bước 2: Chạy Script Tái Cấu Trúc (Tùy chọn)
Mở Terminal / Git Bash tại thư mục dự án và chạy lệnh sau để tự động di chuyển các tệp vào đúng thư mục phân tầng (`src/`, `data/`, `.github/workflows/`):

```bash
python setup_repo_structure.py
```

**Cấu trúc repository sau chuẩn hóa:**
```text
shopee-ai-marginguard/
├── .github/workflows/ci.yml
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── orchestrator.py
│   ├── schemas.py
│   ├── pnl_engine.py
│   └── agents/
│       ├── __init__.py
│       ├── telemetry_agent.py
│       ├── risk_agent.py
│       └── action_agent.py
├── data/
│   ├── mock_shopee_orders.csv
│   └── mock_ad_spend_logs.csv
├── tests/
│   ├── __init__.py
│   └── test_pnl_engine.py
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md
```

---

### 🚀 Bước 3: Thực Hiện Lệnh Git Push
1. **Kiểm tra trạng thái các tệp thay đổi và tệp mới:**
   ```bash
   git status
   ```

2. **Thêm tất cả tệp mới và thay đổi vào Staging Area:**
   ```bash
   git add .
   ```

3. **Tạo Commit với thông điệp chuẩn hóa cho Ban Giám Khảo:**
   ```bash
   git commit -m "feat: refactor repo structure to Hackathon standard and add missing agent components

   - Add Multi-Agent orchestrator and action_agent.py
   - Add Shopee 2026 P&L Engine test coverage and mock ad spend logs
   - Add GitHub Actions CI/CD workflow (.github/workflows/ci.yml)
   - Update README.md with executive financial summary and fee engine specs
   - Configure uv package management (pyproject.toml, .env.example)"
   ```

4. **Đảm bảo nhánh mặc định là main:**
   ```bash
   git branch -M main
   ```

5. **Đẩy toàn bộ mã nguồn lên GitHub:**
   ```bash
   git push -u origin main
   ```
   *(Lưu ý: Nếu Git yêu cầu xác thực tài khoản, hãy nhập Personal Access Token (PAT) hoặc sử dụng khoá SSH của tài khoản `ggia38928-bot`)*.

---

### 🔍 Bước 4: Kiểm Tra Trên GitHub
1. Truy cập vào kho lưu trữ: [https://github.com/ggia38928-bot/Mojo-Agency](https://github.com/ggia38928-bot/Mojo-Agency)
2. Kiểm tra giao diện trang `README.md` đã hiển thị đầy đủ thông tin và bảng công thức.
3. Chuyển sang tab **Actions** trên GitHub để xác nhận quy trình `MarginGuard AI CI/CD Pipeline` tự động chạy kiểm thử thành công (hiển thị tích xanh **Passing**).

---

### 🧪 Chạy Kiểm Thử & Chạy Ứng Dụng Local
- Cài đặt & đồng bộ môi trường với `uv`:
  ```bash
  uv sync --dev
  ```
- Chạy toàn bộ 20 unit tests:
  ```bash
  uv run pytest -v
  ```
- Khởi chạy pipeline điều phối Multi-Agent thời gian thực:
  ```bash
  uv run python src/main.py
  ```