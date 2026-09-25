"""
main.py - Entrypoint for MarginGuard AI System
----------------------------------------------
Chạy quy trình phân tích P&L và điều phối Multi-Agent cắt lỗ thời gian thực.
"""

import sys
import os
from pathlib import Path
import pandas as pd

# Thiết lập UTF-8 cho stdout trên Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Thêm project root và src vào sys.path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent

for p in [str(project_root), str(current_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from src.orchestrator import MarginGuardOrchestrator


def create_sample_datasets():
    """Tạo dữ liệu mẫu nếu chưa có file CSV"""
    orders_data = [
        {"order_id": "ORD_001", "sku": "SKU_FAST_CHARGE_20W", "price": 250000, "quantity": 1, "cogs": 180000, "shop_voucher": 10000, "campaign_id": "CAMP_882"},
        {"order_id": "ORD_002", "sku": "SKU_USB_C_CABLE", "price": 90000, "quantity": 2, "cogs": 45000, "shop_voucher": 5000, "campaign_id": "CAMP_104"},
        {"order_id": "ORD_003", "sku": "SKU_PHONE_CASE", "price": 120000, "quantity": 1, "cogs": 40000, "shop_voucher": 0, "campaign_id": "CAMP_301"},
        {"order_id": "ORD_004", "sku": "SKU_WIRELESS_MOUSE", "price": 350000, "quantity": 1, "cogs": 200000, "shop_voucher": 15000, "campaign_id": "CAMP_909"},
    ]
    ad_spend_data = [
        {"campaign_id": "CAMP_882", "sku": "SKU_FAST_CHARGE_20W", "spend": 120000, "impressions": 5000, "clicks": 250, "conversions": 1},
        {"campaign_id": "CAMP_104", "sku": "SKU_USB_C_CABLE", "spend": 45000, "impressions": 2000, "clicks": 100, "conversions": 2},
        {"campaign_id": "CAMP_301", "sku": "SKU_PHONE_CASE", "spend": 15000, "impressions": 1200, "clicks": 50, "conversions": 1},
        {"campaign_id": "CAMP_909", "sku": "SKU_WIRELESS_MOUSE", "spend": 180000, "impressions": 8000, "clicks": 400, "conversions": 1},
    ]
    return pd.DataFrame(orders_data), pd.DataFrame(ad_spend_data)


def main():
    print("=" * 80)
    print("🚀  MARGINGUARD AI - AUTONOMOUS MULTI-AGENT P&L SAFEGUARD ENGINE")
    print("   Sea x OpenAI Codex Hackathon 2026 | Shopee Margin Protection")
    print("=" * 80)

    # 1. Load Data
    data_dir = project_root / "data"
    orders_csv = data_dir / "mock_shopee_orders.csv"
    ads_csv = data_dir / "mock_ad_spend_logs.csv"

    if not orders_csv.exists():
        orders_csv = project_root / "mock_shopee_orders.csv"
    if not ads_csv.exists():
        ads_csv = project_root / "mock_ad_spend_logs.csv"

    if orders_csv.exists() and ads_csv.exists():
        print(f"📊 Loading transaction data from '{orders_csv.name}' & '{ads_csv.name}'...")
        orders_df = pd.read_csv(orders_csv)
        ads_df = pd.read_csv(ads_csv)
    else:
        print("💡 CSV files not found in data/. Generating mock datasets in-memory...")
        orders_df, ads_df = create_sample_datasets()

    # 2. Run Orchestrator Pipeline
    print("🤖 Initializing Multi-Agent Orchestrator Pipeline...")
    orchestrator = MarginGuardOrchestrator(target_margin_threshold=0.15, warning_margin_threshold=0.05)
    summary = orchestrator.run_pipeline(orders_df, ads_df)

    # 3. Print Executive Summary
    print("\n" + "📈 EXECUTIVE FINANCIAL SUMMARY ".center(80, "-"))
    print(f"• Total Orders Processed : {summary.total_orders_processed}")
    print(f"• Gross Revenue          : ₫{summary.total_revenue:,.0f}")
    print(f"• Total COGS             : ₫{summary.total_cogs:,.0f}")
    print(f"• Total Shopee Fees 2026 : ₫{summary.total_platform_fees:,.0f}")
    print(f"• Total Ad Spend (CAC)   : ₫{summary.total_ad_spend:,.0f}")
    print(f"• Net Profit Realized    : ₫{summary.total_net_profit:,.0f}")
    print(f"• Overall Net Margin %   : {summary.overall_net_margin_pct * 100:.2f}%")
    print(f"• 💰 ESTIMATED SAVINGS  : ₫{summary.total_estimated_savings:,.0f}")
    print("-" * 80)

    # 4. Risk Breakdown
    print("\n🎯 RISK LEVEL DISTRIBUTION:")
    print(f"   [CRITICAL] : {summary.critical_risk_count} campaigns")
    print(f"   [WARNING]  : {summary.warning_risk_count} campaigns")
    print(f"   [NORMAL]   : {summary.normal_risk_count} campaigns")

    # 5. Executed Actions Table
    print("\n⚡ EXECUTED AUTONOMOUS ACTIONS (ACTION AGENT):")
    print("-" * 80)
    print(f"{'SKU':<22} | {'CAMPAIGN':<10} | {'ACTION':<15} | {'SAVINGS (VND)':<14} | STATUS")
    print("-" * 80)
    for act in summary.actions_executed:
        action_str = act.action.value if hasattr(act.action, "value") else str(act.action)
        sku_str = act.sku or act.sku_id or "UNKNOWN"
        camp_str = act.campaign_id or "N/A"
        sav_str = f"₫{act.estimated_savings:<13,.0f}" if act.estimated_savings else "₫0"
        print(f"{sku_str:<22} | {camp_str:<10} | {action_str:<15} | {sav_str} | {act.status}")

    print("-" * 80)
    print("\n📝 DETAILED DECISION LOGS:")
    for i, act in enumerate(summary.actions_executed, 1):
        sku_str = act.sku or act.sku_id or "UNKNOWN"
        print(f"\n[{i}] SKU: {sku_str} (Campaign: {act.campaign_id})")
        print(f"    Action    : {act.action}")
        print(f"    Timestamp : {act.action_timestamp}")
        print(f"    Reasoning : {act.reasoning or act.reason}")

    print("\n" + "=" * 80)
    print("✅ MARGINGUARD AI PIPELINE EXECUTED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    main()
