"""
Action Agent - MarginGuard AI (Shopee x OpenAI Codex Hackathon 2026)
--------------------------------------------------------------------
Autonomous action execution agent responsible for mitigating profit loss,
terminating unprofitable Shopee Ads campaigns, and adjusting bid strategies.
Hỗ trợ đầy đủ cả Functional API (decide_action) và OOP Agent (ActionAgent).
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# Nhập schemas chuẩn từ src.schemas
from src.schemas import (
    RiskLevel,
    ActionCommand,
    ActionCommandSchema as BaseActionCommandSchema,
    PnLAnalysisResult as BasePnLAnalysisResult,
)

# Alias tương thích
ActionType = ActionCommand


class ActionCommandSchema(BaseModel):
    """
    Lệnh hành động tự trị của Action Agent.
    Tương thích 100% cả cấu trúc Pydantic v2 chuẩn Hackathon và Unit Tests.
    """
    sku_id: str = Field(default="", description="Mã SKU")
    sku: Optional[str] = Field(default=None, description="Mã SKU (alias)")
    campaign_id: Optional[str] = Field(default=None, description="ID chiến dịch Ads")
    command: ActionCommand = Field(default=ActionCommand.MAINTAIN, description="Lệnh hành động")
    action: Optional[ActionCommand] = Field(default=None, description="Alias cho command")
    reason: str = Field(default="", description="Lý do ra lệnh")
    reasoning: Optional[str] = Field(default=None, description="Alias cho reason")
    estimated_savings: Optional[float] = Field(default=0.0, description="Ước tính tiền cắt lỗ (VND)")
    new_bid_price: Optional[float] = Field(default=None, description="Giá thầu mới nếu LOWER_BID_50 (VND)")
    action_timestamp: Optional[str] = Field(default=None, description="Thời điểm ISO 8601")
    status: str = Field(default="EXECUTED", description="Trạng thái: EXECUTED | PENDING | FAILED")

    def model_post_init(self, __context: Any) -> None:
        if not self.sku_id and self.sku:
            self.sku_id = self.sku
        elif not self.sku and self.sku_id:
            self.sku = self.sku_id

        if self.action is None:
            self.action = self.command
        elif self.command is None:
            self.command = self.action

        if not self.reason and self.reasoning:
            self.reason = self.reasoning
        elif not self.reasoning and self.reason:
            self.reasoning = self.reason

        if not self.action_timestamp:
            self.action_timestamp = datetime.now(timezone.utc).isoformat()


# Tương thích PnLAnalysisResult
class PnLAnalysisResult(BaseModel):
    sku: Optional[str] = None
    sku_id: Optional[str] = None
    sku_name: Optional[str] = "Product SKU"
    campaign_id: Optional[str] = None
    net_profit: Optional[float] = None
    net_pnl: Optional[float] = None
    net_margin_pct: float = 0.0
    cac: float = 0.0
    gross_margin_per_unit: float = 0.0
    roi: float = 0.0
    risk_level: RiskLevel = RiskLevel.NORMAL
    reason: Optional[str] = None
    reasoning: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if not self.sku and self.sku_id:
            self.sku = self.sku_id
        elif not self.sku_id and self.sku:
            self.sku_id = self.sku

        if self.net_profit is None and self.net_pnl is not None:
            self.net_profit = self.net_pnl
        elif self.net_pnl is None and self.net_profit is not None:
            self.net_pnl = self.net_profit
        elif self.net_profit is None and self.net_pnl is None:
            self.net_profit = 0.0
            self.net_pnl = 0.0

        if not self.reason and self.reasoning:
            self.reason = self.reasoning
        elif not self.reasoning and self.reason:
            self.reasoning = self.reason


# ---------------------------------------------------------------------------
# Functional Decision Logic (Chuẩn Test Suite)
# ---------------------------------------------------------------------------

def decide_action(analysis: Any) -> ActionCommandSchema:
    """
    Ra quyết định can thiệp tự trị dựa trên kết quả phân tích rủi ro.
    Mapping:
        CRITICAL -> KILL_CAMPAIGN
        WARNING  -> LOWER_BID_50
        NORMAL   -> MAINTAIN
    """
    risk = getattr(analysis, "risk_level", RiskLevel.NORMAL)
    if risk == RiskLevel.CRITICAL:
        return _kill_campaign(analysis)
    elif risk == RiskLevel.WARNING:
        return _lower_bid_50(analysis)
    else:
        return _maintain(analysis)


def _kill_campaign(analysis: Any) -> ActionCommandSchema:
    net_val = getattr(analysis, "net_pnl", None)
    if net_val is None:
        net_val = getattr(analysis, "net_profit", 0.0)
    cac_val = getattr(analysis, "cac", 0.0)
    sku = getattr(analysis, "sku_id", None) or getattr(analysis, "sku", "UNKNOWN")
    name = getattr(analysis, "sku_name", sku)
    gross_margin = getattr(analysis, "gross_margin_per_unit", 0.0)
    campaign_id = getattr(analysis, "campaign_id", None)

    savings = abs(net_val) if net_val < 0 else (cac_val if cac_val > 0 else 10000.0)
    reason = (
        f"🚨 KILL_CAMPAIGN: {name} đang lỗ ròng {net_val:,.0f} VNĐ. "
        f"CAC ({cac_val:,.0f} VNĐ) > Biên gộp ({gross_margin:,.0f} VNĐ). "
        f"Dừng ngay để cắt lỗ."
    )
    return ActionCommandSchema(
        sku_id=sku,
        sku=sku,
        campaign_id=campaign_id,
        command=ActionCommand.KILL_CAMPAIGN,
        action=ActionCommand.KILL_CAMPAIGN,
        reason=reason,
        reasoning=reason,
        estimated_savings=savings,
        new_bid_price=None,
    )


def _lower_bid_50(analysis: Any) -> ActionCommandSchema:
    cac_val = getattr(analysis, "cac", 0.0)
    sku = getattr(analysis, "sku_id", None) or getattr(analysis, "sku", "UNKNOWN")
    name = getattr(analysis, "sku_name", sku)
    margin_pct = getattr(analysis, "net_margin_pct", 0.0)
    campaign_id = getattr(analysis, "campaign_id", None)

    new_bid = cac_val * 0.5 if cac_val > 0 else 0.0
    reason = (
        f"⚠️ LOWER_BID_50: {name} biên mỏng {margin_pct:.1%} < 5%. "
        f"Hạ 50% giá thầu từ {cac_val:,.0f} -> ~{new_bid:,.0f} VNĐ/đơn để cải thiện biên."
    )
    return ActionCommandSchema(
        sku_id=sku,
        sku=sku,
        campaign_id=campaign_id,
        command=ActionCommand.LOWER_BID_50,
        action=ActionCommand.LOWER_BID_50,
        reason=reason,
        reasoning=reason,
        estimated_savings=None,
        new_bid_price=new_bid,
    )


def _maintain(analysis: Any) -> ActionCommandSchema:
    sku = getattr(analysis, "sku_id", None) or getattr(analysis, "sku", "UNKNOWN")
    name = getattr(analysis, "sku_name", sku)
    margin_pct = getattr(analysis, "net_margin_pct", 0.0)
    roi_val = getattr(analysis, "roi", 0.0)
    campaign_id = getattr(analysis, "campaign_id", None)

    reason = (
        f"✅ MAINTAIN: {name} an toàn. "
        f"Biên LN ròng {margin_pct:.1%}, ROI Ads {roi_val:.2f}x. Giữ nguyên."
    )
    return ActionCommandSchema(
        sku_id=sku,
        sku=sku,
        campaign_id=campaign_id,
        command=ActionCommand.MAINTAIN,
        action=ActionCommand.MAINTAIN,
        reason=reason,
        reasoning=reason,
        estimated_savings=0.0,
        new_bid_price=None,
    )


def execute_batch_actions(analyses: List[Any]) -> List[ActionCommandSchema]:
    actions = []
    for analysis in analyses:
        act = decide_action(analysis)
        _print_action(act)
        actions.append(act)
        time.sleep(0.02)
    return actions


def _print_action(action: ActionCommandSchema) -> None:
    icons = {
        ActionCommand.KILL_CAMPAIGN: "🚨",
        ActionCommand.LOWER_BID_50: "⚠️",
        ActionCommand.MAINTAIN: "✅",
    }
    icon = icons.get(action.command, "ℹ️")
    print(f"\n  {icon} [{action.command.value}] {action.reason}")
    if action.estimated_savings:
        print(f"     💰 Tiết kiệm ước tính: {action.estimated_savings:,.0f} VNĐ")
    if action.new_bid_price is not None:
        print(f"     🎯 Giá thầu mới: ~{action.new_bid_price:,.0f} VNĐ")


# ---------------------------------------------------------------------------
# OOP ActionAgent (Chuẩn Hackathon Orchestrator)
# ---------------------------------------------------------------------------

class ActionAgent:
    """
    Autonomous Action Agent in MarginGuard AI.
    Processes risk findings and executes margin protection commands.
    """

    def __init__(self, loss_tolerance_margin: float = 0.05):
        self.loss_tolerance_margin = loss_tolerance_margin

    def evaluate_and_execute(self, pnl_result: Any, ad_spend: float = 0.0) -> ActionCommandSchema:
        sku = getattr(pnl_result, "sku_id", None) or getattr(pnl_result, "sku", "UNKNOWN")
        net_val = getattr(pnl_result, "net_pnl", None)
        if net_val is None:
            net_val = getattr(pnl_result, "net_profit", 0.0)
        margin_pct = getattr(pnl_result, "net_margin_pct", 0.0)
        risk = getattr(pnl_result, "risk_level", RiskLevel.NORMAL)

        if risk == RiskLevel.CRITICAL or net_val < 0:
            cmd = _kill_campaign(pnl_result)
            if ad_spend > 0:
                cmd.estimated_savings = round(abs(net_val) + (ad_spend * 0.8), 2)
            return cmd
        elif risk == RiskLevel.WARNING or margin_pct < self.loss_tolerance_margin:
            cmd = _lower_bid_50(pnl_result)
            if ad_spend > 0:
                cmd.estimated_savings = round(ad_spend * 0.5, 2)
            return cmd
        else:
            return _maintain(pnl_result)

    def process_batch(
        self, pnl_results: List[Any], ad_spends: Optional[List[float]] = None
    ) -> List[ActionCommandSchema]:
        actions = []
        for i, res in enumerate(pnl_results):
            spend = ad_spends[i] if ad_spends and i < len(ad_spends) else 0.0
            actions.append(self.evaluate_and_execute(res, ad_spend=spend))
        return actions


def run_action_agent(pnl_result: Any, ad_spend: float = 0.0) -> ActionCommandSchema:
    agent = ActionAgent()
    return agent.evaluate_and_execute(pnl_result, ad_spend=ad_spend)
