"""
orchestrator.py - MarginGuard AI Multi-Agent Orchestrator
---------------------------------------------------------
Điều phối luồng công việc tự động giữa Telemetry Agent, Risk Agent,
PnL Engine và Action Agent để bảo vệ biên lợi nhuận Shopee Seller.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
from pydantic import BaseModel, Field

# Đảm bảo đường dẫn import
try:
    from src.agents.action_agent import (
        ActionAgent,
        PnLAnalysisResult,
        RiskLevel,
        ActionCommandSchema,
        ActionType,
    )
except ImportError:
    try:
        from agents.action_agent import (
            ActionAgent,
            PnLAnalysisResult,
            RiskLevel,
            ActionCommandSchema,
            ActionType,
        )
    except ImportError:
        from action_agent import (
            ActionAgent,
            PnLAnalysisResult,
            RiskLevel,
            ActionCommandSchema,
            ActionType,
        )


class SystemRunSummary(BaseModel):
    total_orders_processed: int
    total_revenue: float
    total_cogs: float
    total_platform_fees: float
    total_ad_spend: float
    total_net_profit: float
    overall_net_margin_pct: float
    total_estimated_savings: float
    critical_risk_count: int
    warning_risk_count: int
    normal_risk_count: int
    actions_executed: List[ActionCommandSchema]


class PnLEngine:
    """
    Shopee 2026 Fee Engine: Tính toán chính xác doanh thu, chi phí sàn và lợi nhuận ròng.
    - Phí thanh toán: 4.91%
    - Phí cố định: 4.0%
    - Phí dịch vụ (Voucher Xtra/Freeship Xtra): 4.0% (Tối đa 50,000đ/sản phẩm)
    """

    PAYMENT_FEE_RATE = 0.0491
    FIXED_FEE_RATE = 0.0400
    SERVICE_FEE_RATE = 0.0400
    SERVICE_FEE_CAP = 50000.0

    @classmethod
    def calculate_pnl(
        cls,
        gross_revenue: float,
        cogs: float,
        shop_voucher: float,
        ad_spend: float,
        voucher_xtra_applied: bool = True,
    ) -> Dict[str, float]:
        payment_fee = gross_revenue * cls.PAYMENT_FEE_RATE
        fixed_fee = gross_revenue * cls.FIXED_FEE_RATE
        if voucher_xtra_applied:
            raw_service_fee = gross_revenue * cls.SERVICE_FEE_RATE
            service_fee = min(raw_service_fee, cls.SERVICE_FEE_CAP)
        else:
            service_fee = 0.0

        total_platform_fees = payment_fee + fixed_fee + service_fee
        net_profit = gross_revenue - cogs - total_platform_fees - shop_voucher - ad_spend
        net_margin_pct = net_profit / gross_revenue if gross_revenue > 0 else 0.0

        return {
            "payment_fee": payment_fee,
            "fixed_fee": fixed_fee,
            "service_fee": service_fee,
            "total_platform_fees": total_platform_fees,
            "net_profit": net_profit,
            "net_margin_pct": net_margin_pct,
        }


class MarginGuardOrchestrator:
    """
    Bộ điều phối trung tâm quản lý luồng dữ liệu Multi-Agent
    """

    def __init__(self, target_margin_threshold: float = 0.15, warning_margin_threshold: float = 0.05):
        self.target_margin_threshold = target_margin_threshold
        self.warning_margin_threshold = warning_margin_threshold
        self.action_agent = ActionAgent(loss_tolerance_margin=warning_margin_threshold)

    def assess_risk_level(self, net_profit: float, net_margin_pct: float) -> RiskLevel:
        if net_profit < 0 or net_margin_pct < 0:
            return RiskLevel.CRITICAL
        elif net_margin_pct < self.warning_margin_threshold:
            return RiskLevel.WARNING
        else:
            return RiskLevel.NORMAL

    def run_pipeline(
        self, orders_df: pd.DataFrame, ad_spend_df: Optional[pd.DataFrame] = None
    ) -> SystemRunSummary:
        """
        Khởi chạy toàn bộ luồng xử lý Multi-Agent từ dữ liệu đơn hàng và log quảng cáo
        """
        # Map ad spend by SKU / Campaign
        ad_spend_map: Dict[str, float] = {}
        if ad_spend_df is not None and not ad_spend_df.empty:
            for _, row in ad_spend_df.iterrows():
                sku_key = str(row.get("sku", row.get("sku_id", "")))
                camp_key = str(row.get("campaign_id", ""))
                spend = float(row.get("spend", row.get("spend_today", 0.0)))
                if sku_key:
                    ad_spend_map[sku_key] = ad_spend_map.get(sku_key, 0.0) + spend
                if camp_key:
                    ad_spend_map[camp_key] = ad_spend_map.get(camp_key, 0.0) + spend

        total_rev = 0.0
        total_cogs = 0.0
        total_fees = 0.0
        total_ads = 0.0
        total_profit = 0.0

        critical_cnt = 0
        warning_cnt = 0
        normal_cnt = 0

        pnl_results: List[PnLAnalysisResult] = []
        sku_ad_spends: List[float] = []

        # Process orders
        for _, row in orders_df.iterrows():
            sku = str(row.get("sku_id", row.get("sku", "UNKNOWN_SKU")))
            sku_name = str(row.get("sku_name", sku))
            qty = int(row.get("units_sold", row.get("quantity", row.get("qty", 1))))

            # Doanh thu
            if "revenue" in row and pd.notna(row["revenue"]) and float(row["revenue"]) > 0:
                revenue = float(row["revenue"])
            else:
                price = float(row.get("price", row.get("item_price", 0.0)))
                revenue = price * qty

            # COGS
            raw_cogs = float(row.get("cogs", revenue * 0.5))
            if "units_sold" not in row and "quantity" in row:
                cogs = raw_cogs * qty
            else:
                cogs = raw_cogs

            voucher = float(row.get("voucher_shop", row.get("shop_voucher", 0.0)))
            campaign_id = str(row.get("campaign_id", f"CAMP_{sku}"))
            voucher_xtra = str(row.get("voucher_xtra_applied", "true")).lower() == "true"

            # Ad spend
            ad_spend = 0.0
            if campaign_id in ad_spend_map:
                ad_spend = ad_spend_map[campaign_id]
            elif sku in ad_spend_map:
                ad_spend = ad_spend_map[sku]
            else:
                ad_spend = float(row.get("ad_spend", 0.0))

            pnl = PnLEngine.calculate_pnl(revenue, cogs, voucher, ad_spend, voucher_xtra)

            risk_lvl = self.assess_risk_level(pnl["net_profit"], pnl["net_margin_pct"])

            if risk_lvl == RiskLevel.CRITICAL:
                critical_cnt += 1
            elif risk_lvl == RiskLevel.WARNING:
                warning_cnt += 1
            else:
                normal_cnt += 1

            pnl_res = PnLAnalysisResult(
                sku=sku,
                sku_id=sku,
                sku_name=sku_name,
                campaign_id=campaign_id,
                net_profit=pnl["net_profit"],
                net_pnl=pnl["net_profit"],
                net_margin_pct=pnl["net_margin_pct"],
                cac=ad_spend / qty if qty > 0 else ad_spend,
                risk_level=risk_lvl,
                reasoning=f"P&L: Rev={revenue:,.0f}, COGS={cogs:,.0f}, Fees={pnl['total_platform_fees']:,.0f}, Ads={ad_spend:,.0f} -> Profit={pnl['net_profit']:,.0f} VND ({pnl['net_margin_pct']*100:.1f}%)"
            )

            pnl_results.append(pnl_res)
            sku_ad_spends.append(ad_spend)

            total_rev += revenue
            total_cogs += cogs
            total_fees += pnl["total_platform_fees"]
            total_ads += ad_spend
            total_profit += pnl["net_profit"]

        # Delegate to Action Agent
        executed_actions = self.action_agent.process_batch(pnl_results, ad_spends=sku_ad_spends)
        total_savings = sum((act.estimated_savings or 0.0) for act in executed_actions)

        overall_margin = total_profit / total_rev if total_rev > 0 else 0.0

        return SystemRunSummary(
            total_orders_processed=len(orders_df),
            total_revenue=total_rev,
            total_cogs=total_cogs,
            total_platform_fees=total_fees,
            total_ad_spend=total_ads,
            total_net_profit=total_profit,
            overall_net_margin_pct=overall_margin,
            total_estimated_savings=total_savings,
            critical_risk_count=critical_cnt,
            warning_risk_count=warning_cnt,
            normal_risk_count=normal_cnt,
            actions_executed=executed_actions,
        )
