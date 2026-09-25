"""
src/main.py — Script Chạy Chính — Bước 1.5
============================================
Tích hợp toàn bộ luồng Multi-Agent vào entry point chính.

Khi thực thi lệnh:
    uv run python src/main.py
    # hoặc
    python src/main.py          # chạy với inline mock data
    python src/main.py --csv    # chạy với data/mock_shopee_orders.csv

Sẽ in ra Terminal:
    1. Banner khởi động MarginGuard AI
    2. Luồng xử lý real-time từng Agent
    3. Kết quả phân tích P&L từng SKU
    4. Lệnh can thiệp tự trị (KILL/LOWER/MAINTAIN)
    5. Báo cáo tổng kết Orchestrator

PoC hoàn toàn Runnable — không cần Shopee API key thực.
"""

from __future__ import annotations

import sys
import os

# Force UTF-8 output trên Windows (tránh lỗi CP1252 với emoji/tiếng Việt)
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Thêm thư mục gốc vào Python path để import module src.*
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.orchestrator import MultiAgentOrchestrator


def main() -> None:
    """Entry point chính của MarginGuard AI."""
    use_csv = "--csv" in sys.argv

    orchestrator = MultiAgentOrchestrator(use_csv=use_csv)
    report = orchestrator.run()

    # Exit code dựa trên kết quả pipeline:
    #   0 = pipeline chạy thành công (dù có KILL hay không)
    #   1 = pipeline gặp lỗi không mong đợi (exception sẽ raise trước khi tới đây)
    sys.exit(0)


if __name__ == "__main__":
    main()
