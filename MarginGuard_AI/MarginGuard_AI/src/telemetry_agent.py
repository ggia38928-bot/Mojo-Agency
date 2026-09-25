"""
Telemetry Agent — Bước 1.1 support / Bước 2.2
===============================================
Đọc luồng dữ liệu giao dịch đơn hàng & Shopee Ads,
chuyển đổi thành Pydantic Schemas chuẩn để cung cấp cho Risk Analyzer Agent.
"""

from __future__ import annotations

import csv
import time
from pathlib import Path
from typing import Generator, List

from src.schemas import OrderTelemetrySchema


# Đường dẫn mock data mặc định
DEFAULT_MOCK_DATA_PATH = Path(__file__).parent.parent / "data" / "mock_shopee_orders.csv"


def load_telemetry_from_csv(filepath: str | Path = DEFAULT_MOCK_DATA_PATH) -> List[OrderTelemetrySchema]:
    """
    Đọc file CSV mock Shopee Orders và trả về danh sách OrderTelemetrySchema.

    Args:
        filepath: Đường dẫn file CSV mock data

    Returns:
        List[OrderTelemetrySchema] đã validate bằng Pydantic v2
    """
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"Không tìm thấy file mock data: {filepath}")

    records: List[OrderTelemetrySchema] = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            telemetry = OrderTelemetrySchema(
                sku_id=row["sku_id"],
                sku_name=row["sku_name"],
                revenue=float(row["revenue"]),
                cogs=float(row["cogs"]),
                ad_spend=float(row["ad_spend"]),
                units_sold=int(row["units_sold"]),
                voucher_shop=float(row.get("voucher_shop", 0.0)),
                voucher_xtra_applied=row.get("voucher_xtra_applied", "false").lower() == "true",
                campaign_id=row.get("campaign_id") or None,
                timestamp=row.get("timestamp") or None,
            )
            records.append(telemetry)
    return records


def stream_telemetry(
    records: List[OrderTelemetrySchema],
    delay_ms: int = 200,
) -> Generator[OrderTelemetrySchema, None, None]:
    """
    Giả lập streaming real-time dữ liệu telemetry.

    Args:
        records:  Danh sách telemetry đã load
        delay_ms: Độ trễ giữa mỗi record (mô phỏng luồng thực tế)

    Yields:
        OrderTelemetrySchema từng record một
    """
    for record in records:
        yield record
        time.sleep(delay_ms / 1000.0)


def get_inline_mock_data() -> List[OrderTelemetrySchema]:
    """
    Trả về mock data inline (không cần file CSV) để chạy demo.

    Bao gồm 3 SKU test case:
      - SKU-001: An toàn (NORMAL)
      - SKU-002: Biên mỏng (WARNING)
      - SKU-003: SKU bẫy cắt lỗ Mega Sale (CRITICAL)
    """
    return [
        OrderTelemetrySchema(
            sku_id="SKU-001",
            sku_name="Ốp Lưng iPhone 15 Pro Premium",
            revenue=450_000,
            cogs=120_000,
            ad_spend=45_000,
            units_sold=3,
            voucher_shop=15_000,
            voucher_xtra_applied=False,
            campaign_id="CAMP-001",
            timestamp="2026-09-25T08:00:00",
        ),
        OrderTelemetrySchema(
            sku_id="SKU-002",
            sku_name="Tai Nghe Bluetooth V5.3",
            revenue=320_000,
            cogs=190_000,
            ad_spend=35_000,
            units_sold=2,
            voucher_shop=10_000,
            voucher_xtra_applied=True,
            campaign_id="CAMP-002",
            timestamp="2026-09-25T08:05:00",
        ),
        OrderTelemetrySchema(
            sku_id="SKU-003",
            sku_name="Bộ Sạc Nhanh 20W (SKU Mega Sale ⚡)",
            revenue=350_000,
            cogs=270_000,
            ad_spend=85_000,
            units_sold=1,
            voucher_shop=20_000,
            voucher_xtra_applied=True,
            campaign_id="CAMP-003",
            timestamp="2026-09-25T08:10:00",
        ),
    ]
