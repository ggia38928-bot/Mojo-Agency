import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionCommand } from '../../../common/enums/action-command.enum';

export class ActionCommandDto {
  @ApiProperty({ description: 'Mã SKU sản phẩm', example: 'SKU-003' })
  skuId: string;

  @ApiPropertyOptional({ description: 'ID chiến dịch Ads nếu có', example: 'CAMP-003' })
  campaignId?: string;

  @ApiProperty({ enum: ActionCommand, description: 'Lệnh can thiệp tự trị' })
  command: ActionCommand;

  @ApiProperty({ description: 'Lý do can thiệp chi tiết' })
  reason: string;

  @ApiPropertyOptional({ description: 'Ước tính số tiền cắt lỗ được (VNĐ)', example: 35000 })
  estimatedSavings?: number;

  @ApiPropertyOptional({ description: 'Giá thầu mới nếu là lệnh LOWER_BID_50 (VNĐ)', example: 20000 })
  newBidPrice?: number;
}
