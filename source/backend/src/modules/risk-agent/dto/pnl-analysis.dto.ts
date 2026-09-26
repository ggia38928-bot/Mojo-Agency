import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '../../../common/enums/risk-level.enum';

export class PnLAnalysisResultDto {
  @ApiProperty({ description: 'Mã SKU sản phẩm', example: 'SKU-001' })
  skuId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Ốp Lưng iPhone 15 Pro Premium' })
  skuName: string;

  @ApiProperty({ description: 'Lợi nhuận ròng (VNĐ)', example: 125000 })
  netPnL: number;

  @ApiProperty({ description: 'Biên lợi nhuận ròng (%)', example: 0.278 })
  netMarginPct: number;

  @ApiProperty({ description: 'Chi phí mua khách hàng (VNĐ/đơn)', example: 15000 })
  cac: number;

  @ApiProperty({ description: 'Biên lợi nhuận gộp trên mỗi đơn (VNĐ)', example: 110000 })
  grossMarginPerUnit: number;

  @ApiProperty({ description: 'ROI của Shopee Ads', example: 2.78 })
  roi: number;

  @ApiProperty({ enum: RiskLevel, description: 'Phân loại mức độ rủi ro' })
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Lý do phân loại rủi ro chi tiết' })
  reason: string;
}
