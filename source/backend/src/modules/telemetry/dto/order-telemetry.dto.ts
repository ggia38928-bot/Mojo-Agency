import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OrderTelemetryDto {
  @ApiProperty({ description: 'Mã định danh SKU sản phẩm', example: 'SKU-001' })
  @IsString()
  skuId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Ốp Lưng iPhone 15 Pro Premium' })
  @IsString()
  skuName: string;

  @ApiProperty({ description: 'Doanh thu thuần (VNĐ)', example: 450000, minimum: 0 })
  @IsNumber()
  @Min(0)
  revenue: number;

  @ApiProperty({ description: 'Giá vốn hàng bán (VNĐ)', example: 120000, minimum: 0 })
  @IsNumber()
  @Min(0)
  cogs: number;

  @ApiProperty({ description: 'Chi phí Shopee Ads (VNĐ)', example: 45000, minimum: 0 })
  @IsNumber()
  @Min(0)
  adSpend: number;

  @ApiProperty({ description: 'Số đơn bán được', example: 3, minimum: 0 })
  @IsNumber()
  @Min(0)
  unitsSold: number;

  @ApiPropertyOptional({ description: 'Voucher shop tự tài trợ (VNĐ)', example: 15000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  voucherShop?: number = 0;

  @ApiPropertyOptional({ description: 'Có dùng Voucher Xtra không', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  voucherXtraApplied?: boolean = false;

  @ApiPropertyOptional({ description: 'ID chiến dịch Ads', example: 'CAMP-001' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Thời điểm ghi nhận telemetry (ISO string)', example: '2026-09-25T08:00:00' })
  @IsOptional()
  @IsString()
  timestamp?: string;
}
