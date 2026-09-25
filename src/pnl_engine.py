"""
P&L Calculator Engine — Chuẩn Shopee 2026
==========================================
Bước 1.4: Module hạt nhân tính toán P&L ròng chính xác theo bộ công thức Shopee 2026.

Công thức:
    Net P&L = Revenue - COGS - Fees - AdSpend - Voucher_Shop

Chi phí Shopee 2026:
    - Phí cố định (Commission):     8.00%  of Revenue
    - Phí thanh toán (đã gồm VAT): 4.91%  of Revenue
    - Phí dịch vụ Voucher Xtra:     4.00%  of Revenue (khi áp dụng)
"""

from __future__ import annotations

from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Hằng số phí Shopee 2026
# ---------------------------------------------------------------------------

SHOPEE_COMMISSION_RATE: float = 0.08      # Phí cố định 8%
SHOPEE_PAYMENT_FEE_RATE: float = 0.0491   # Phí thanh toán 4.91% (đã VAT)
SHOPEE_VOUCHER_XTRA_RATE: float = 0.04    # Phí dịch vụ Voucher Xtra 4%

# Ngưỡng biên lợi nhuận cảnh báo
THIN_MARGIN_THRESHOLD: float = 0.05       # <5% → WARNING
CRITICAL_LOSS_THRESHOLD: float = 0.0      # <0  → CRITICAL (đang lỗ)


# ---------------------------------------------------------------------------
# Data Classes
# ---------------------------------------------------------------------------

@dataclass
class ShopeeFeesBreakdown:
    """Chi tiết từng loại phí Shopee."""
    commission: float           # 8% of revenue
    payment_fee: float          # 4.91% of revenue
    voucher_xtra_fee: float     # 4% of revenue (nếu áp dụng)
    total_fees: float           # Tổng phí Shopee

    def __str__(self) -> str:
        return (
            f"  Phí cố định (8%):       {self.commission:>12,.0f} VNĐ\n"
            f"  Phí thanh toán (4.91%): {self.payment_fee:>12,.0f} VNĐ\n"
            f"  Phí Voucher Xtra (4%):  {self.voucher_xtra_fee:>12,.0f} VNĐ\n"
            f"  ─────────────────────────────────────────\n"
            f"  Tổng phí Shopee:        {self.total_fees:>12,.0f} VNĐ"
        )


@dataclass
class PnLResult:
    """Kết quả tính toán P&L đầy đủ cho một SKU/campaign."""
    sku_id: str
    sku_name: str

    # Đầu vào
    revenue: float              # Doanh thu thuần
    cogs: float                 # Giá vốn hàng bán
    ad_spend: float             # Chi phí quảng cáo Shopee Ads
    voucher_shop: float         # Voucher do shop tự tài trợ
    units_sold: int             # Số đơn bán được
    voucher_xtra_applied: bool  # Có áp dụng Voucher Xtra không

    # Tính toán
    fees: ShopeeFeesBreakdown = field(init=False)
    net_pnl: float = field(init=False)
    net_margin_pct: float = field(init=False)
    cac: float = field(init=False)              # Chi phí mua khách hàng
    roi: float = field(init=False)              # Return on Ad Spend (ROAS)
    gross_margin_per_unit: float = field(init=False)

    def __post_init__(self) -> None:
        self.fees = _calculate_shopee_fees(
            revenue=self.revenue,
            voucher_xtra_applied=self.voucher_xtra_applied,
        )
        self.gross_margin_per_unit = (
            (self.revenue - self.cogs) / self.units_sold
            if self.units_sold > 0 else 0.0
        )
        self.net_pnl = (
            self.revenue
            - self.cogs
            - self.fees.total_fees
            - self.ad_spend
            - self.voucher_shop
        )
        self.net_margin_pct = (
            self.net_pnl / self.revenue if self.revenue > 0 else 0.0
        )
        self.cac = (
            self.ad_spend / self.units_sold if self.units_sold > 0 else 0.0
        )
        self.roi = (
            self.net_pnl / self.ad_spend if self.ad_spend > 0 else 0.0
        )

    def summary(self) -> str:
        """In tóm tắt P&L ra terminal."""
        margin_label = _margin_label(self.net_margin_pct)
        return (
            f"\n{'═'*52}\n"
            f"  SKU: {self.sku_name} [{self.sku_id}]\n"
            f"{'─'*52}\n"
            f"  Doanh thu:              {self.revenue:>12,.0f} VNĐ\n"
            f"  Giá vốn (COGS):         {self.cogs:>12,.0f} VNĐ\n"
            f"  Chi phí Shopee Fees:\n{self.fees}\n"
            f"  Chi phí Ads:            {self.ad_spend:>12,.0f} VNĐ\n"
            f"  Voucher Shop:           {self.voucher_shop:>12,.0f} VNĐ\n"
            f"{'─'*52}\n"
            f"  💰 Net P&L:             {self.net_pnl:>12,.0f} VNĐ\n"
            f"  📊 Biên LN ròng:        {self.net_margin_pct:>11.1%}  {margin_label}\n"
            f"  👥 CAC:                 {self.cac:>12,.0f} VNĐ/đơn\n"
            f"  📈 Biên LN gộp/đơn:    {self.gross_margin_per_unit:>12,.0f} VNĐ/đơn\n"
            f"  🔥 ROI Ads:             {self.roi:>12.2f}x\n"
            f"{'═'*52}"
        )


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

def _calculate_shopee_fees(
    revenue: float,
    voucher_xtra_applied: bool = False,
) -> ShopeeFeesBreakdown:
    """
    Tính toán chi tiết phí Shopee 2026.

    Args:
        revenue: Doanh thu thuần (VNĐ)
        voucher_xtra_applied: True nếu có áp dụng chương trình Voucher Xtra

    Returns:
        ShopeeFeesBreakdown với chi tiết từng loại phí
    """
    commission = revenue * SHOPEE_COMMISSION_RATE
    payment_fee = revenue * SHOPEE_PAYMENT_FEE_RATE
    voucher_xtra_fee = revenue * SHOPEE_VOUCHER_XTRA_RATE if voucher_xtra_applied else 0.0
    total_fees = commission + payment_fee + voucher_xtra_fee

    return ShopeeFeesBreakdown(
        commission=commission,
        payment_fee=payment_fee,
        voucher_xtra_fee=voucher_xtra_fee,
        total_fees=total_fees,
    )


def calculate_pnl(
    sku_id: str,
    sku_name: str,
    revenue: float,
    cogs: float,
    ad_spend: float,
    units_sold: int,
    voucher_shop: float = 0.0,
    voucher_xtra_applied: bool = False,
) -> PnLResult:
    """
    Tính P&L ròng chuẩn Shopee 2026.

    Công thức cốt lõi:
        Net P&L = Revenue - COGS - Fees - AdSpend - Voucher_Shop

    Args:
        sku_id:               Mã SKU sản phẩm
        sku_name:             Tên sản phẩm
        revenue:              Doanh thu thuần (VNĐ)
        cogs:                 Tổng giá vốn (VNĐ)
        ad_spend:             Chi phí quảng cáo Shopee Ads (VNĐ)
        units_sold:           Số đơn hàng bán được
        voucher_shop:         Voucher do shop tự tài trợ (VNĐ), mặc định 0
        voucher_xtra_applied: Có áp dụng Voucher Xtra không, mặc định False

    Returns:
        PnLResult đầy đủ chi tiết tính toán
    """
    return PnLResult(
        sku_id=sku_id,
        sku_name=sku_name,
        revenue=revenue,
        cogs=cogs,
        ad_spend=ad_spend,
        voucher_shop=voucher_shop,
        units_sold=units_sold,
        voucher_xtra_applied=voucher_xtra_applied,
    )


def _margin_label(margin: float) -> str:
    """Trả về emoji label theo mức biên lợi nhuận."""
    if margin >= THIN_MARGIN_THRESHOLD:
        return "✅ SAFE"
    elif margin >= CRITICAL_LOSS_THRESHOLD:
        return "⚠️  WARNING (Biên mỏng)"
    else:
        return "🚨 CRITICAL (Đang LỖ)"


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Ví dụ: SKU Bộ Sạc Nhanh 20W — SKU bẫy cắt lỗ
    result = calculate_pnl(
        sku_id="SKU-BOsacnhanh-20W",
        sku_name="Bộ Sạc Nhanh 20W (SKU Mega Sale)",
        revenue=350_000,
        cogs=270_000,
        ad_spend=85_000,
        units_sold=1,
        voucher_shop=20_000,
        voucher_xtra_applied=True,
    )
    print(result.summary())
