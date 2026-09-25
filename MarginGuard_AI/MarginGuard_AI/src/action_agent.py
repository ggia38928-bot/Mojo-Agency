"""
Action Agent — Can Thiệp Tự Trị — Bước 1.3
=============================================
Logic ra quyết định tự trị can thiệp trực tiếp không cần con người.

Ba lệnh can thiệp:
  KILL_CAMPAIGN  → Dừng quảng cáo cắt lỗ (CAC > Biên gộp — CRITICAL)
  LOWER_BID_50   → Hạ 50% giá thầu (biên mỏng — WARNING)
  MAINTAIN       → Giữ nguyên (an toàn — NORMAL)

Module này là "tay" của hệ thống — thực thi quyết định từ Risk Agent.
"""

from __future__ import annotations

import time
from typing import List, Optional

from src.schemas import (
    PnLAnalysisResult,
    ActionCommand,
    ActionCommandSchema,
    RiskLevel,
)


# ---------------------------------------------------------------------------
# Action Decision Logic
# ---------------------------------------------------------------------------

def decide_action(analysis: PnLAnalysisResult) -> ActionCommandSchema:
    """
    Ra quyết định can thiệp tự trị dựa trên kết quả phân tích rủi ro.

    Mapping logic:
        CRITICAL → KILL_CAMPAIGN   (dừng toàn bộ chi tiêu Ads ngay)
        WARNING  → LOWER_BID_50    (hạ 50% giá thầu để bảo vệ biên)
        NORMAL   → MAINTAIN        (giữ nguyên chiến lược hiện tại)

    Args:
        analysis: Kết quả phân tích từ Risk Threshold Agent

    Returns:
        ActionCommandSchema với lệnh và lý do đầy đủ
    """
    if analysis.risk_level == RiskLevel.CRITICAL:
        return _kill_campaign(analysis)
    elif analysis.risk_level == RiskLevel.WARNING:
        return _lower_bid_50(analysis)
    else:
        return _maintain(analysis)


def execute_batch_actions(
    analyses: List[PnLAnalysisResult],
) -> List[ActionCommandSchema]:
    """Thực thi can thiệp theo batch cho nhiều SKU."""
    actions = []
    for analysis in analyses:
        action = decide_action(analysis)
        _print_action(action)
        actions.append(action)
        time.sleep(0.05)
    return actions


# ---------------------------------------------------------------------------
# Private action builders
# ---------------------------------------------------------------------------

def _kill_campaign(analysis: PnLAnalysisResult) -> ActionCommandSchema:
    """KILL_CAMPAIGN — dừng Ads, cắt lỗ ngay."""
    estimated_savings = abs(analysis.net_pnl) if analysis.net_pnl < 0 else analysis.cac
    return ActionCommandSchema(
        sku_id=analysis.sku_id,
        campaign_id=None,
        command=ActionCommand.KILL_CAMPAIGN,
        reason=(
            f"🚨 KILL_CAMPAIGN: {analysis.sku_name} đang lỗ ròng "
            f"{analysis.net_pnl:,.0f} VNĐ. "
            f"CAC ({analysis.cac:,.0f} VNĐ) > "
            f"Biên gộp ({analysis.gross_margin_per_unit:,.0f} VNĐ). "
            f"Dừng ngay để cắt lỗ."
        ),
        estimated_savings=estimated_savings,
        new_bid_price=None,
    )


def _lower_bid_50(analysis: PnLAnalysisResult) -> ActionCommandSchema:
    """LOWER_BID_50 — hạ 50% giá thầu bảo vệ biên."""
    # Tính giá thầu mới (ước tính): giảm CAC xuống 50%
    estimated_new_bid = analysis.cac * 0.5 if analysis.cac > 0 else 0.0
    return ActionCommandSchema(
        sku_id=analysis.sku_id,
        campaign_id=None,
        command=ActionCommand.LOWER_BID_50,
        reason=(
            f"⚠️  LOWER_BID_50: {analysis.sku_name} biên mỏng "
            f"{analysis.net_margin_pct:.1%} < 5%. "
            f"Hạ 50% giá thầu từ {analysis.cac:,.0f} → "
            f"~{estimated_new_bid:,.0f} VNĐ/đơn để cải thiện biên."
        ),
        estimated_savings=None,
        new_bid_price=estimated_new_bid,
    )


def _maintain(analysis: PnLAnalysisResult) -> ActionCommandSchema:
    """MAINTAIN — giữ nguyên chiến lược."""
    return ActionCommandSchema(
        sku_id=analysis.sku_id,
        campaign_id=None,
        command=ActionCommand.MAINTAIN,
        reason=(
            f"✅ MAINTAIN: {analysis.sku_name} an toàn. "
            f"Biên LN ròng {analysis.net_margin_pct:.1%}, "
            f"ROI Ads {analysis.roi:.2f}x. Giữ nguyên."
        ),
        estimated_savings=None,
        new_bid_price=None,
    )


def _print_action(action: ActionCommandSchema) -> None:
    """In lệnh can thiệp ra terminal."""
    cmd_icons = {
        ActionCommand.KILL_CAMPAIGN: "🛑",
        ActionCommand.LOWER_BID_50:  "📉",
        ActionCommand.MAINTAIN:      "✅",
    }
    icon = cmd_icons[action.command]
    print(f"\n  {icon} [{action.command.value}]")
    print(f"     {action.reason}")
    if action.estimated_savings:
        print(f"     💰 Tiết kiệm ước tính: {action.estimated_savings:,.0f} VNĐ")
    if action.new_bid_price is not None:
        print(f"     📌 Giá thầu mới: ~{action.new_bid_price:,.0f} VNĐ/đơn")
