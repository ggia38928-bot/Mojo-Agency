import { Injectable, Logger } from '@nestjs/common';
import { ActionCommand } from '../../common/enums/action-command.enum';
import { RiskLevel } from '../../common/enums/risk-level.enum';
import { PnLAnalysisResultDto } from '../risk-agent/dto/pnl-analysis.dto';
import { ActionCommandDto } from './dto/action-command.dto';

@Injectable()
export class ActionAgentService {
  private readonly logger = new Logger(ActionAgentService.name);

  /**
   * Ra quyết định can thiệp tự trị dựa trên phân tích rủi ro.
   * Mapping:
   *   CRITICAL → KILL_CAMPAIGN (dừng chiến dịch Ads ngay lập tức)
   *   WARNING  → LOWER_BID_50  (hạ 50% giá thầu để bảo vệ biên mỏng)
   *   NORMAL   → MAINTAIN      (giữ nguyên trạng thái an toàn)
   */
  decideAction(analysis: PnLAnalysisResultDto): ActionCommandDto {
    if (analysis.riskLevel === RiskLevel.CRITICAL) {
      return this.killCampaign(analysis);
    } else if (analysis.riskLevel === RiskLevel.WARNING) {
      return this.lowerBid50(analysis);
    } else {
      return this.maintain(analysis);
    }
  }

  /**
   * Thực thi can thiệp hàng loạt cho nhiều SKU.
   */
  executeBatchActions(analyses: PnLAnalysisResultDto[]): ActionCommandDto[] {
    return analyses.map((analysis) => {
      const action = this.decideAction(analysis);
      this.logAction(action);
      return action;
    });
  }

  private killCampaign(analysis: PnLAnalysisResultDto): ActionCommandDto {
    const estimatedSavings =
      analysis.netPnL < 0 ? Math.abs(analysis.netPnL) : analysis.cac;

    return {
      skuId: analysis.skuId,
      command: ActionCommand.KILL_CAMPAIGN,
      reason: `🚨 KILL_CAMPAIGN: ${analysis.skuName} đang lỗ ròng ${analysis.netPnL.toLocaleString('vi-VN')} VNĐ. CAC (${analysis.cac.toLocaleString('vi-VN')} VNĐ) > Biên gộp (${analysis.grossMarginPerUnit.toLocaleString('vi-VN')} VNĐ). Dừng ngay để cắt lỗ.`,
      estimatedSavings,
    };
  }

  private lowerBid50(analysis: PnLAnalysisResultDto): ActionCommandDto {
    const estimatedNewBid = analysis.cac > 0 ? analysis.cac * 0.5 : 0;

    return {
      skuId: analysis.skuId,
      command: ActionCommand.LOWER_BID_50,
      reason: `⚠️ LOWER_BID_50: ${analysis.skuName} biên mỏng ${(analysis.netMarginPct * 100).toFixed(1)}% < 5%. Hạ 50% giá thầu từ ${analysis.cac.toLocaleString('vi-VN')} → ~${estimatedNewBid.toLocaleString('vi-VN')} VNĐ/đơn để cải thiện biên.`,
      newBidPrice: estimatedNewBid,
    };
  }

  private maintain(analysis: PnLAnalysisResultDto): ActionCommandDto {
    return {
      skuId: analysis.skuId,
      command: ActionCommand.MAINTAIN,
      reason: `✅ MAINTAIN: ${analysis.skuName} an toàn. Biên LN ròng ${(analysis.netMarginPct * 100).toFixed(1)}%, ROI Ads ${analysis.roi.toFixed(2)}x. Giữ nguyên.`,
    };
  }

  private logAction(action: ActionCommandDto): void {
    const icons = {
      [ActionCommand.KILL_CAMPAIGN]: '🛑 [KILL_CAMPAIGN]',
      [ActionCommand.LOWER_BID_50]: '📉 [LOWER_BID_50]',
      [ActionCommand.MAINTAIN]: '✅ [MAINTAIN]',
    };

    let extra = '';
    if (action.estimatedSavings) {
      extra = ` | Tiết kiệm: ${action.estimatedSavings.toLocaleString('vi-VN')} VNĐ`;
    } else if (action.newBidPrice !== undefined) {
      extra = ` | Bid mới: ~${action.newBidPrice.toLocaleString('vi-VN')} VNĐ`;
    }

    this.logger.log(`${icons[action.command]} SKU: ${action.skuId} -> ${action.reason}${extra}`);
  }
}
