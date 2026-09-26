import { ApiProperty } from '@nestjs/swagger';
import { PnLAnalysisResultDto } from '../../risk-agent/dto/pnl-analysis.dto';
import { ActionCommandDto } from '../../action-agent/dto/action-command.dto';

export class OrchestratorReportDto {
  @ApiProperty({ description: 'Tổng số SKU được phân tích', example: 3 })
  totalSkus: number;

  @ApiProperty({ description: 'Số lượng SKU trạng thái NORMAL (an toàn)', example: 1 })
  normalCount: number;

  @ApiProperty({ description: 'Số lượng SKU trạng thái WARNING (biên mỏng)', example: 1 })
  warningCount: number;

  @ApiProperty({ description: 'Số lượng SKU trạng thái CRITICAL (đang lỗ)', example: 1 })
  criticalCount: number;

  @ApiProperty({ description: 'Số chiến dịch Ads bị kích hoạt dừng khẩn cấp (KILL)', example: 1 })
  campaignsKilled: number;

  @ApiProperty({ description: 'Số chiến dịch Ads được hạ 50% giá thầu', example: 1 })
  bidsLowered: number;

  @ApiProperty({ description: 'Số chiến dịch Ads giữ nguyên', example: 1 })
  maintained: number;

  @ApiProperty({ description: 'Tổng số tiền ước tính cắt lỗ thành công (VNĐ)', example: 85000 })
  totalEstimatedSavings: number;

  @ApiProperty({ type: [PnLAnalysisResultDto], description: 'Chi tiết phân tích P&L từng SKU' })
  analyses: PnLAnalysisResultDto[];

  @ApiProperty({ type: [ActionCommandDto], description: 'Chi tiết lệnh can thiệp tự trị từng SKU' })
  actions: ActionCommandDto[];

  @ApiProperty({ description: 'Thời điểm hoàn thành chu kỳ phân tích (ISO)', example: '2026-09-25T15:00:00.000Z' })
  executedAt: string;
}
