/**
 * Chi phí Shopee 2026 và các ngưỡng rủi ro của MarginGuard AI
 */
export const SHOPEE_COMMISSION_RATE = 0.08;      // Phí cố định 8%
export const SHOPEE_PAYMENT_FEE_RATE = 0.0491;   // Phí thanh toán 4.91% (đã gồm VAT)
export const SHOPEE_VOUCHER_XTRA_RATE = 0.04;    // Phí dịch vụ Voucher Xtra 4% (khi áp dụng)

export const THIN_MARGIN_THRESHOLD = 0.05;       // < 5% → WARNING (biên mỏng)
export const CRITICAL_LOSS_THRESHOLD = 0.0;      // < 0% → CRITICAL (lỗ ròng)
