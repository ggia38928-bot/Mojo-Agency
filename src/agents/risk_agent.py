"""
Risk Threshold Agent — Bước 1.2
================================
Module tiếp nhận dữ liệu telemetry, áp dụng công thức P&L Shopee 2026
để tính Lợi nhuận ròng, CAC, ROI và phân loại chính xác rủi ro:
  - NORMAL   : Biên LN ròng >= 5%  → chiến dịch an toàn
  - WARNING  : Biên LN ròng 0%-5%  → biên mỏng, cần theo dõi
  - CRITICAL : Lỗ ròng < 0%        → cắt lỗ ngay lập tức

Ngưỡng CAC so sánh biên gộp:
  Nếu CAC > gross_margin_per_unit → đang mua đơn với giá lỗ.
"""

from __future__ import annotations

import time
from typing import List

from src.schemas import (
    OrderTelemetrySchema,
    PnLAnalysisResult,
    RiskLevel,
)
from src.pnl_engine import calculate_pnl, THIN_MARGIN_THRESHOLD, CRITICAL_LOSS_THRESHOLD


def analyze_risk(telemetry: OrderTelemetrySchema) -> PnLAnalysisResult:
    """
    Phân tích rủi ro P&L của một SKU.

    Args:
        telemetry: Dữ liệu telemetry từ Shopee (đơn hàng + Ads)

    Returns:
        PnLAnalysisResult với risk_level và reason
    """
    pnl = calculate_pnl(
        sku_id=telemetry.sku_id,
        sku_name=telemetry.sku_name,
        revenue=telemetry.revenue,
        cogs=telemetry.cogs,
        ad_spend=telemetry.ad_spend,
        units_sold=telemetry.units_sold,
        voucher_shop=telemetry.voucher_shop,
        voucher_xtra_applied=telemetry.voucher_xtra_applied,
    )

    # Phân loại rủi ro
    risk_level, reason = _classify_risk(
        net_margin_pct=pnl.net_margin_pct,
        cac=pnl.cac,
        gross_margin_per_unit=pnl.gross_margin_per_unit,
        net_pnl=pnl.net_pnl,
    )

    return PnLAnalysisResult(
        sku_id=pnl.sku_id,
        sku_name=pnl.sku_name,
        net_pnl=pnl.net_pnl,
        net_margin_pct=pnl.net_margin_pct,
        cac=pnl.cac,
        gross_margin_per_unit=pnl.gross_margin_per_unit,
        roi=pnl.roi,
        risk_level=risk_level,
        reason=reason,
    )


def analyze_batch(telemetry_list: List[OrderTelemetrySchema]) -> List[PnLAnalysisResult]:
    """Phân tích rủi ro theo batch cho nhiều SKU."""
    results = []
    for telemetry in telemetry_list:
        result = analyze_risk(telemetry)
        _print_analysis(result)
        results.append(result)
        time.sleep(0.05)  # Simulate real-time processing delay
    return results


def _classify_risk(
    net_margin_pct: float,
    cac: float,
    gross_margin_per_unit: float,
    net_pnl: float,
) -> tuple[RiskLevel, str]:
    """
    Phân loại rủi ro dựa trên các chỉ số P&L.

    Logic phân loại:
      1. Nếu lỗ ròng (net_margin < 0) hoặc CAC > biên gộp → CRITICAL
      2. Nếu biên mỏng (0 <= net_margin < 5%)            → WARNING
      3. Còn lại                                           → NORMAL
    """
    cac_exceeds_margin = (
        cac > gross_margin_per_unit and gross_margin_per_unit > 0
    )

    if net_margin_pct < CRITICAL_LOSS_THRESHOLD or cac_exceeds_margin:
        reason_parts = []
        if net_margin_pct < CRITICAL_LOSS_THRESHOLD:
            reason_parts.append(
                f"Lỗ ròng {net_margin_pct:.1%} — đang đốt tiền mỗi đơn"
            )
        if cac_exceeds_margin:
            reason_parts.append(
                f"CAC {cac:,.0f} VNĐ > Biên gộp {gross_margin_per_unit:,.0f} VNĐ"
            )
        return RiskLevel.CRITICAL, " | ".join(reason_parts)

    elif net_margin_pct < THIN_MARGIN_THRESHOLD:
        return (
            RiskLevel.WARNING,
            f"Biên mỏng {net_margin_pct:.1%} — dưới ngưỡng an toàn 5%, cần theo dõi",
        )

    else:
        return (
            RiskLevel.NORMAL,
            f"An toàn — Biên LN ròng {net_margin_pct:.1%}, CAC kiểm soát tốt",
        )


def _print_analysis(result: PnLAnalysisResult) -> None:
    """In kết quả phân tích ra terminal (real-time stream)."""
    icon = {
        RiskLevel.NORMAL: "✅",
        RiskLevel.WARNING: "⚠️ ",
        RiskLevel.CRITICAL: "🚨",
    }[result.risk_level]

    print(
        f"  [{icon} {result.risk_level.value:8s}] {result.sku_name}\n"
        f"             Net P&L: {result.net_pnl:>10,.0f} VNĐ | "
        f"Biên: {result.net_margin_pct:.1%} | "
        f"CAC: {result.cac:,.0f} VNĐ\n"
        f"             → {result.reason}"
    )
