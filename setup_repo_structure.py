#!/usr/bin/env python3
"""
Setup Repo Structure - MarginGuard AI
------------------------------------
Script tự động khởi tạo và sắp xếp cấu hình thư mục chuẩn quốc tế cho dự án 
MarginGuard AI theo tiêu chuẩn Sea x OpenAI Codex Hackathon 2026.
"""

import os
import shutil
import sys
from pathlib import Path

# Đảm bảo UTF-8 trên Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def setup_repository(repo_dir: str = "."):
    root = Path(repo_dir).resolve()
    print(f"🚀 Bắt đầu chuẩn hóa cấu trúc repository tại: {root}\n")

    # 1. Danh sách các thư mục chuẩn cần tạo
    required_dirs = [
        root / ".github" / "workflows",
        root / "src" / "agents",
        root / "data",
        root / "tests",
    ]

    for d in required_dirs:
        d.mkdir(parents=True, exist_ok=True)
        print(f"  [✓] Đã tạo thư mục: {d.relative_to(root)}")

    # 2. Tạo các tệp __init__.py để biến src, agents, tests thành Python Modules
    init_files = [
        root / "src" / "__init__.py",
        root / "src" / "agents" / "__init__.py",
        root / "tests" / "__init__.py",
    ]
    for init_f in init_files:
        if not init_f.exists() or init_f.stat().st_size == 0:
            if init_f == root / "src" / "__init__.py":
                init_f.write_text(
                    'import sys\nfrom src.agents import risk_agent, action_agent, telemetry_agent\n\n'
                    'sys.modules["src.risk_agent"] = risk_agent\n'
                    'sys.modules["src.action_agent"] = action_agent\n'
                    'sys.modules["src.telemetry_agent"] = telemetry_agent\n\n'
                    '__all__ = ["risk_agent", "action_agent", "telemetry_agent"]\n',
                    encoding="utf-8"
                )
            else:
                init_f.touch()
            print(f"  [✓] Đã tạo module marker: {init_f.relative_to(root)}")

    # 3. Quy tắc di chuyển các tệp vào thư mục chuẩn
    file_mapping = {
        "ci.yml": root / ".github" / "workflows" / "ci.yml",
        "main.py": root / "src" / "main.py",
        "orchestrator.py": root / "src" / "orchestrator.py",
        "schemas.py": root / "src" / "schemas.py",
        "pnl_engine.py": root / "src" / "pnl_engine.py",
        "risk_agent.py": root / "src" / "agents" / "risk_agent.py",
        "action_agent.py": root / "src" / "agents" / "action_agent.py",
        "telemetry_agent.py": root / "src" / "agents" / "telemetry_agent.py",
        "mock_shopee_orders.csv": root / "data" / "mock_shopee_orders.csv",
        "mock_ad_spend_logs.csv": root / "data" / "mock_ad_spend_logs.csv",
        "test_pnl_engine.py": root / "tests" / "test_pnl_engine.py",
    }

    moved_count = 0
    for src_name, dest_path in file_mapping.items():
        src_path = root / src_name
        if src_path.exists() and src_path != dest_path:
            shutil.move(str(src_path), str(dest_path))
            print(f"  [➔] Di chuyển: {src_name} ➔ {dest_path.relative_to(root)}")
            moved_count += 1

    # 4. Tạo hoặc cập nhật .gitignore chuẩn
    gitignore_path = root / ".gitignore"
    gitignore_content = """# Python & Virtual Environments
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
ENV/

# Pytest & Coverage
.pytest_cache/
.coverage
htmlcov/
nodeids
CACHEDIR.TAG

# IDE & OS files
.vscode/
.idea/
.DS_Store

# Environment Variables & API Keys
.env
*.rar
*.zip
"""
    with open(gitignore_path, "w", encoding="utf-8") as f:
        f.write(gitignore_content.strip() + "\n")
    print(f"  [✓] Đã tạo/cập nhật tệp lọc Git: .gitignore")

    # 5. Dọn dẹp các tệp cache rác nếu có
    junk_files = ["nodeids", "CACHEDIR.TAG"]
    for jf in junk_files:
        p = root / jf
        if p.exists():
            p.unlink()
            print(f"  [🗑️] Đã dọn dẹp tệp rác: {jf}")

    print("\n" + "=" * 60)
    print("✅ HOÀN THÀNH TÁI CẤU TRÚC REPOSITORY THEO CHUẨN HACKATHON")
    print("=" * 60)
    print("""
Cấu trúc thư mục mới:
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
│   └── test_pnl_engine.py
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md

👉 Bước tiếp theo:
1. Chạy 'uv sync' để cài đặt môi trường.
2. Chạy 'uv run python src/main.py' để khởi chạy ứng dụng.
3. Chạy 'uv run pytest' để kiểm thử tự động.
""")


if __name__ == "__main__":
    setup_repository()