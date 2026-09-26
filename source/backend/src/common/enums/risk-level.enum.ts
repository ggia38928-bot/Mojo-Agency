export enum RiskLevel {
  NORMAL = 'NORMAL',       // Biên LN an toàn >= 5%
  WARNING = 'WARNING',     // Biên LN mỏng 0% - 5%
  CRITICAL = 'CRITICAL',   // Đang lỗ ròng < 0% hoặc CAC > Biên gộp
}
