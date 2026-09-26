import { Injectable, Logger } from '@nestjs/common';
import { RiskLevel } from '../../common/enums/risk-level.enum';
import {
  THIN_MARGIN_THRESHOLD,
  CRITICAL_LOSS_THRESHOLD,
} from '../../common/constants/shopee-fees.constant';
import { PnlEngineService } from '../pnl-engine/pnl-engine.service';
import { OrderTelemetryDto } from '../telemetry/dto/order-telemetry.dto';
import { PnLAnalysisResultDto } from './dto/pnl-analysis.dto';

@Injectable()
export class RiskAgentService {
  private readonly logger = new Logger(RiskAgentService.name);

  constructor(private readonly pnlEngine: PnlEngineService) {}

  /**
   * Phân tích rủi ro P&L của một SKU dựa trên telemetry.
   */
  analyzeRisk(telemetry: OrderTelemetryDto): PnLAnalysisResultDto {
    const pnl = this.pnlEngine.calculatePnL({
      skuId: telemetry.skuId,
      skuName: telemetry.skuName,
      revenue: telemetry.revenue,
      cogs: telemetry.cogs,
      adSpend: telemetry.adSpend,
      unitsSold: telemetry.unitsSold,
      voucherShop: telemetry.voucherShop,
      voucherXtraApplied: telemetry.voucherXtraApplied,
    });

    const { riskLevel, reason } = this.classifyRisk(
      pnl.netMarginPct,
      pnl.cac,
      pnl.grossMarginPerUnit,
      pnl.netPnL,
    );

    return {
      skuId: pnl.skuId,
      skuName: pnl.skuName,
      netPnL: pnl.netPnL,
      netMarginPct: pnl.netMarginPct,
      cac: pnl.cac,
      grossMarginPerUnit: pnl.grossMarginPerUnit,
      roi: pnl.roi,
      riskLevel,
      reason,
    };
  }

  /**
   * Phân tích rủi ro theo batch cho nhiều SKU.
   */
  analyzeBatch(telemetryList: OrderTelemetryDto[]): PnLAnalysisResultDto[] {
    return telemetryList.map((telemetry) => {
      const result = this.analyzeRisk(telemetry);
      this.logAnalysis(result);
      return result;
    });
  }

  /**
   * Phân loại rủi ro:
   * 1. CRITICAL: Nếu Net Margin < 0% hoặc CAC > Biên gộp đơn hàng
   * 2. WARNING: Nếu 0% <= Net Margin < 5% (biên mỏng)
   * 3. NORMAL: Nếu Net Margin >= 5% và CAC nằm trong tầm kiểm soát
   */
  classifyRisk(
    netMarginPct: number,
    cac: number,
    grossMarginPerUnit: number,
    netPnL: number,
  ): { riskLevel: RiskLevel; reason: string } {
    const cacExceedsMargin =
      cac > grossMarginPerUnit && grossMarginPerUnit > 0;

    if (netMarginPct < CRITICAL_LOSS_THRESHOLD || cacExceedsMargin) {
      const reasons: string[] = [];
      if (netMarginPct < CRITICAL_LOSS_THRESHOLD) {
        reasons.push(
          `Lỗ ròng ${(netMarginPct * 100).toFixed(1)}% (${netPnL.toLocaleString('vi-VN')} VNĐ) — đang đốt tiền mỗi đơn`,
        );
      }
      if (cacExceedsMargin) {
        reasons.push(
          `CAC ${cac.toLocaleString('vi-VN')} VNĐ > Biên gộp ${grossMarginPerUnit.toLocaleString('vi-VN')} VNĐ`,
        );
      }
      return {
        riskLevel: RiskLevel.CRITICAL,
        reason: reasons.join(' | '),
      };
    } else if (netMarginPct < THIN_MARGIN_THRESHOLD) {
      return {
        riskLevel: RiskLevel.WARNING,
        reason: `Biên mỏng ${(netMarginPct * 100).toFixed(1)}% — dưới ngưỡng an toàn 5%, cần theo dõi`,
      };
    } else {
      return {
        riskLevel: RiskLevel.NORMAL,
        reason: `An toàn — Biên LN ròng ${(netMarginPct * 100).toFixed(1)}%, CAC kiểm soát tốt`,
      };
    }
  }

  private logAnalysis(result: PnLAnalysisResultDto): void {
    const icon = {
      [RiskLevel.NORMAL]: '✅ [NORMAL]',
      [RiskLevel.WARNING]: '⚠️  [WARNING]',
      [RiskLevel.CRITICAL]: '🚨 [CRITICAL]',
    }[result.riskLevel];

    this.logger.log(
      `${icon} ${result.skuName} | Net P&L: ${result.netPnL.toLocaleString('vi-VN')} VNĐ | Margin: ${(result.netMarginPct * 100).toFixed(1)}% | CAC: ${result.cac.toLocaleString('vi-VN')} VNĐ -> ${result.reason}`,
    );
  }
}
