"""
Pydantic v2 Data Schemas — MarginGuard AI
==========================================
Data Contracts dùng chung toàn bộ Multi-Agent system.
(Đây là nền tảng cho Bước 2.1 — Linh, nhưng Trình cần để build agents)
"""

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Phân loại mức rủi ro của chiến dịch quảng cáo."""
    NORMAL = "NORMAL"       # Biên LN an toàn >= 5%
    WARNING = "WARNING"     # Biên LN mỏng 0% - 5%
    CRITICAL = "CRITICAL"   # Đang lỗ ròng < 0%


class ActionCommand(str, Enum):
    """Lệnh can thiệp tự trị của Action Agent."""
    KILL_CAMPAIGN = "KILL_CAMPAIGN"   # Dừng quảng cáo ngay — cắt lỗ
    LOWER_BID_50 = "LOWER_BID_50"     # Hạ 50% giá thầu — biên mỏng
    MAINTAIN = "MAINTAIN"             # Giữ nguyên — an toàn


class OrderTelemetrySchema(BaseModel):
    """Dữ liệu telemetry đơn hàng & Ads từ Shopee."""
    sku_id: str = Field(..., description="Mã định danh SKU sản phẩm")
    sku_name: str = Field(..., description="Tên sản phẩm")
    revenue: float = Field(..., ge=0, description="Doanh thu thuần (VNĐ)")
    cogs: float = Field(..., ge=0, description="Giá vốn hàng bán (VNĐ)")
    ad_spend: float = Field(..., ge=0, description="Chi phí Shopee Ads (VNĐ)")
    units_sold: int = Field(..., ge=0, description="Số đơn bán được")
    voucher_shop: float = Field(default=0.0, ge=0, description="Voucher shop tự tài trợ (VNĐ)")
    voucher_xtra_applied: bool = Field(default=False, description="Có dùng Voucher Xtra")
    campaign_id: Optional[str] = Field(default=None, description="ID chiến dịch Ads")
    timestamp: Optional[str] = Field(default=None, description="Thời điểm ghi nhận telemetry")


class AdSpendLogSchema(BaseModel):
    """Log chi phí quảng cáo Shopee Ads."""
    campaign_id: str
    sku_id: str
    bid_price: float = Field(..., ge=0, description="Giá thầu hiện tại (VNĐ/click)")
    daily_budget: float = Field(..., ge=0, description="Ngân sách ngày (VNĐ)")
    spend_today: float = Field(..., ge=0, description="Đã chi hôm nay (VNĐ)")
    clicks: int = Field(..., ge=0)
    impressions: int = Field(..., ge=0)
    orders_attributed: int = Field(..., ge=0)


class PnLAnalysisResult(BaseModel):
    """Kết quả phân tích P&L từ Risk Threshold Agent."""
    sku_id: str
    sku_name: str
    net_pnl: float = Field(..., description="Lợi nhuận ròng (VNĐ)")
    net_margin_pct: float = Field(..., description="Biên LN ròng (%)")
    cac: float = Field(..., description="Chi phí mua khách hàng (VNĐ/đơn)")
    gross_margin_per_unit: float = Field(..., description="Biên LN gộp/đơn (VNĐ)")
    roi: float = Field(..., description="ROI của Ads (x lần)")
    risk_level: RiskLevel
    reason: str = Field(..., description="Giải thích phân loại rủi ro")


class ActionCommandSchema(BaseModel):
    """Lệnh hành động tự trị của Action Agent."""
    sku_id: str
    campaign_id: Optional[str]
    command: ActionCommand
    reason: str = Field(..., description="Lý do ra lệnh")
    estimated_savings: Optional[float] = Field(
        default=None,
        description="Ước tính tiền cắt lỗ được (VNĐ)"
    )
    new_bid_price: Optional[float] = Field(
        default=None,
        description="Giá thầu mới nếu lệnh LOWER_BID_50 (VNĐ)"
    )
