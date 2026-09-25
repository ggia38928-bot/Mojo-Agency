"""
Unit Tests — P&L Engine & Multi-Agent Logic
============================================
Bộ test tự động cho thuật toán P&L và logic phân loại rủi ro.
Chạy: pytest tests/test_pnl_engine.py -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from src.pnl_engine import calculate_pnl, _calculate_shopee_fees
from src.schemas import (
    OrderTelemetrySchema,
    RiskLevel,
    ActionCommand,
)
from src.risk_agent import analyze_risk
from src.action_agent import decide_action


# ---------------------------------------------------------------------------
# Test P&L Calculator Engine (Bước 1.4)
# ---------------------------------------------------------------------------

class TestShopeeFeesCalculation:
    """Kiểm tra tính toán phí Shopee 2026."""

    def test_commission_rate_8_percent(self):
        fees = _calculate_shopee_fees(revenue=1_000_000)
        assert fees.commission == pytest.approx(80_000, rel=1e-6)

    def test_payment_fee_4_91_percent(self):
        fees = _calculate_shopee_fees(revenue=1_000_000)
        assert fees.payment_fee == pytest.approx(49_100, rel=1e-6)

    def test_voucher_xtra_4_percent_when_applied(self):
        fees = _calculate_shopee_fees(revenue=1_000_000, voucher_xtra_applied=True)
        assert fees.voucher_xtra_fee == pytest.approx(40_000, rel=1e-6)

    def test_no_voucher_xtra_when_not_applied(self):
        fees = _calculate_shopee_fees(revenue=1_000_000, voucher_xtra_applied=False)
        assert fees.voucher_xtra_fee == 0.0

    def test_total_fees_without_voucher_xtra(self):
        fees = _calculate_shopee_fees(revenue=1_000_000, voucher_xtra_applied=False)
        expected = 80_000 + 49_100  # commission + payment_fee
        assert fees.total_fees == pytest.approx(expected, rel=1e-6)

    def test_total_fees_with_voucher_xtra(self):
        fees = _calculate_shopee_fees(revenue=1_000_000, voucher_xtra_applied=True)
        expected = 80_000 + 49_100 + 40_000  # all 3 fees
        assert fees.total_fees == pytest.approx(expected, rel=1e-6)


class TestNetPnLFormula:
    """Kiểm tra công thức Net P&L = Revenue - COGS - Fees - AdSpend - Voucher_Shop."""

    def test_profitable_sku_positive_pnl(self):
        result = calculate_pnl(
            sku_id="SKU-TEST-001",
            sku_name="Test SKU Profitable",
            revenue=500_000,
            cogs=150_000,
            ad_spend=30_000,
            units_sold=5,
            voucher_shop=10_000,
            voucher_xtra_applied=False,
        )
        assert result.net_pnl > 0, "SKU lãi phải có Net P&L dương"

    def test_loss_making_sku_negative_pnl(self):
        """SKU bẫy cắt lỗ Mega Sale: CAC 85k > biên gộp 60k → lỗ ròng."""
        result = calculate_pnl(
            sku_id="SKU-003",
            sku_name="Bộ Sạc Nhanh 20W",
            revenue=350_000,
            cogs=270_000,
            ad_spend=85_000,
            units_sold=1,
            voucher_shop=20_000,
            voucher_xtra_applied=True,
        )
        assert result.net_pnl < 0, "SKU cắt lỗ phải có Net P&L âm"

    def test_pnl_formula_correctness(self):
        """Kiểm tra công thức Net P&L cụ thể với số liệu biết trước."""
        revenue = 1_000_000
        cogs = 400_000
        ad_spend = 100_000
        voucher_shop = 50_000
        # fees = 8% + 4.91% = 129,100 (không có Voucher Xtra)
        expected_fees = 1_000_000 * (0.08 + 0.0491)
        expected_net_pnl = revenue - cogs - expected_fees - ad_spend - voucher_shop

        result = calculate_pnl(
            sku_id="SKU-FORMULA",
            sku_name="Formula Test",
            revenue=revenue,
            cogs=cogs,
            ad_spend=ad_spend,
            units_sold=10,
            voucher_shop=voucher_shop,
            voucher_xtra_applied=False,
        )
        assert result.net_pnl == pytest.approx(expected_net_pnl, rel=1e-6)

    def test_cac_calculation(self):
        result = calculate_pnl(
            sku_id="SKU-CAC",
            sku_name="CAC Test",
            revenue=300_000,
            cogs=100_000,
            ad_spend=60_000,
            units_sold=3,
            voucher_shop=0,
        )
        assert result.cac == pytest.approx(20_000, rel=1e-6)  # 60k / 3

    def test_zero_units_sold_cac_is_zero(self):
        result = calculate_pnl(
            sku_id="SKU-ZERO",
            sku_name="Zero Units",
            revenue=0,
            cogs=0,
            ad_spend=50_000,
            units_sold=0,
        )
        assert result.cac == 0.0
        assert result.gross_margin_per_unit == 0.0


# ---------------------------------------------------------------------------
# Test Risk Threshold Agent (Bước 1.2)
# ---------------------------------------------------------------------------

class TestRiskClassification:
    """Kiểm tra phân loại rủi ro NORMAL / WARNING / CRITICAL."""

    def _make_telemetry(self, **kwargs) -> OrderTelemetrySchema:
        defaults = dict(
            sku_id="SKU-X",
            sku_name="Test",
            revenue=500_000,
            cogs=200_000,
            ad_spend=30_000,
            units_sold=5,
            voucher_shop=0,
            voucher_xtra_applied=False,
        )
        defaults.update(kwargs)
        return OrderTelemetrySchema(**defaults)

    def test_normal_risk_high_margin(self):
        t = self._make_telemetry(
            revenue=500_000, cogs=150_000, ad_spend=20_000, units_sold=5
        )
        result = analyze_risk(t)
        assert result.risk_level == RiskLevel.NORMAL

    def test_critical_risk_loss_making(self):
        """SKU bẫy cắt lỗ Mega Sale phải phân loại CRITICAL."""
        t = self._make_telemetry(
            revenue=350_000,
            cogs=270_000,
            ad_spend=85_000,
            units_sold=1,
            voucher_shop=20_000,
            voucher_xtra_applied=True,
        )
        result = analyze_risk(t)
        assert result.risk_level == RiskLevel.CRITICAL

    def test_warning_risk_thin_margin(self):
        """Biên mỏng 0% < margin < 5% → WARNING."""
        # Crafted so net margin is ~3.2% (between 0-5%) and CAC < gross_margin_per_unit
        t = self._make_telemetry(
            revenue=500_000,
            cogs=350_000,
            ad_spend=45_000,
            units_sold=5,
            voucher_shop=20_000,
            voucher_xtra_applied=False,
        )
        result = analyze_risk(t)
        # Verify: fees = 500k * 12.91% = 64,550
        # net_pnl = 500k - 350k - 64,550 - 45k - 20k = 20,450
        # margin = 20,450 / 500k = 4.09% → WARNING
        assert result.risk_level == RiskLevel.WARNING

    def test_analysis_result_has_all_fields(self):
        t = self._make_telemetry()
        result = analyze_risk(t)
        assert result.sku_id is not None
        assert result.net_pnl is not None
        assert result.net_margin_pct is not None
        assert result.cac is not None
        assert result.risk_level in RiskLevel
        assert len(result.reason) > 0


# ---------------------------------------------------------------------------
# Test Action Agent (Bước 1.3)
# ---------------------------------------------------------------------------

class TestActionAgent:
    """Kiểm tra logic ra lệnh can thiệp của Action Agent."""

    def _make_analysis(
        self,
        risk_level: RiskLevel,
        net_pnl: float = -50_000,
        cac: float = 85_000,
        gross_margin: float = 60_000,
        net_margin_pct: float = -0.15,
    ):
        from src.schemas import PnLAnalysisResult
        return PnLAnalysisResult(
            sku_id="SKU-X",
            sku_name="Test SKU",
            net_pnl=net_pnl,
            net_margin_pct=net_margin_pct,
            cac=cac,
            gross_margin_per_unit=gross_margin,
            roi=-0.5,
            risk_level=risk_level,
            reason="Test reason",
        )

    def test_critical_triggers_kill_campaign(self):
        analysis = self._make_analysis(RiskLevel.CRITICAL)
        action = decide_action(analysis)
        assert action.command == ActionCommand.KILL_CAMPAIGN

    def test_warning_triggers_lower_bid_50(self):
        analysis = self._make_analysis(
            RiskLevel.WARNING,
            net_pnl=5_000,
            net_margin_pct=0.02,
            cac=40_000,
        )
        action = decide_action(analysis)
        assert action.command == ActionCommand.LOWER_BID_50

    def test_normal_triggers_maintain(self):
        analysis = self._make_analysis(
            RiskLevel.NORMAL,
            net_pnl=80_000,
            net_margin_pct=0.15,
            cac=20_000,
        )
        action = decide_action(analysis)
        assert action.command == ActionCommand.MAINTAIN

    def test_kill_campaign_has_estimated_savings(self):
        analysis = self._make_analysis(RiskLevel.CRITICAL, net_pnl=-30_000)
        action = decide_action(analysis)
        assert action.command == ActionCommand.KILL_CAMPAIGN
        assert action.estimated_savings is not None
        assert action.estimated_savings > 0

    def test_lower_bid_50_has_new_bid_price(self):
        analysis = self._make_analysis(
            RiskLevel.WARNING,
            cac=60_000,
            net_margin_pct=0.03,
            net_pnl=5_000,
        )
        action = decide_action(analysis)
        assert action.new_bid_price is not None
        assert action.new_bid_price == pytest.approx(30_000, rel=1e-6)  # 60k * 0.5
