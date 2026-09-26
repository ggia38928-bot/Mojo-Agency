import { Injectable, Logger } from '@nestjs/common';
import { ActionCommand } from '../../common/enums/action-command.enum';
import { RiskLevel } from '../../common/enums/risk-level.enum';
import { ActionAgentService } from '../action-agent/action-agent.service';
import { RiskAgentService } from '../risk-agent/risk-agent.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { OrderTelemetryDto } from '../telemetry/dto/order-telemetry.dto';
import { OrchestratorReportDto } from './dto/orchestrator-report.dto';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly riskAgent: RiskAgentService,
    private readonly actionAgent: ActionAgentService,
  ) {}

  /**
   * Thực thi toàn bộ pipeline Multi-Agent theo Agent Delegation Pattern:
   *   1. Telemetry Agent: Nạp dữ liệu giao dịch & Ads
   *   2. Risk Threshold Agent: Tính P&L và đánh giá nguy cơ cháy ngân sách
   *   3. Action Agent: Ra quyết định can thiệp tự trị (KILL / LOWER / MAINTAIN)
   *   4. Tổng hợp báo cáo OrchestratorReport
   */
  async runPipeline(
    useCsv: boolean = false,
    customTelemetry?: OrderTelemetryDto[],
  ): Promise<OrchestratorReportDto> {
    this.logger.log('🚀 [Orchestrator] Khởi động pipeline bảo vệ P&L...');

    // ── Bước 1: Thu thập telemetry
    const telemetryRecords =
      customTelemetry && customTelemetry.length > 0
        ? customTelemetry
        : useCsv
        ? this.telemetryService.loadTelemetryFromCsv()
        : this.telemetryService.getInlineMockData();

    this.logger.log(
      `📡 [AGENT 1 - Telemetry] Đã nhận ${telemetryRecords.length} SKU từ luồng Shopee.`,
    );

    // ── Bước 2: Phân tích rủi ro
    this.logger.log(
      '🔍 [AGENT 2 - Risk Threshold] Đang phân tích P&L theo chuẩn Shopee 2026...',
    );
    const analyses = this.riskAgent.analyzeBatch(telemetryRecords);

    // ── Bước 3: Ra lệnh can thiệp tự trị
    this.logger.log(
      '🤖 [AGENT 3 - Action Agent] Đang thực thi can thiệp tự trị...',
    );
    const actions = this.actionAgent.executeBatchActions(analyses);

    // ── Bước 4: Tổng hợp báo cáo
    const report = this.buildReport(analyses, actions);
    this.logReport(report);

    return report;
  }

  private buildReport(analyses: any[], actions: any[]): OrchestratorReportDto {
    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let campaignsKilled = 0;
    let bidsLowered = 0;
    let maintained = 0;
    let totalEstimatedSavings = 0;

    for (const analysis of analyses) {
      if (analysis.riskLevel === RiskLevel.NORMAL) normalCount++;
      else if (analysis.riskLevel === RiskLevel.WARNING) warningCount++;
      else if (analysis.riskLevel === RiskLevel.CRITICAL) criticalCount++;
    }

    for (const action of actions) {
      if (action.command === ActionCommand.KILL_CAMPAIGN) {
        campaignsKilled++;
        totalEstimatedSavings += action.estimatedSavings || 0;
      } else if (action.command === ActionCommand.LOWER_BID_50) {
        bidsLowered++;
      } else if (action.command === ActionCommand.MAINTAIN) {
        maintained++;
      }
    }

    return {
      totalSkus: analyses.length,
      normalCount,
      warningCount,
      criticalCount,
      campaignsKilled,
      bidsLowered,
      maintained,
      totalEstimatedSavings,
      analyses,
      actions,
      executedAt: new Date().toISOString(),
    };
  }

  private logReport(report: OrchestratorReportDto): void {
    this.logger.log('======================================================');
    this.logger.log('📋 [ORCHESTRATOR FINAL REPORT]');
    this.logger.log(`  Tổng SKU phân tích:      ${report.totalSkus}`);
    this.logger.log(`  ✅ An toàn (NORMAL):     ${report.normalCount}`);
    this.logger.log(`  ⚠️  Biên mỏng (WARNING):  ${report.warningCount}`);
    this.logger.log(`  🚨 Đang lỗ (CRITICAL):   ${report.criticalCount}`);
    this.logger.log(`  🛑 Chiến dịch bị KILL:   ${report.campaignsKilled}`);
    this.logger.log(`  📉 Hạ 50% giá thầu:      ${report.bidsLowered}`);
    this.logger.log(`  ✅ Giữ nguyên:           ${report.maintained}`);
    if (report.totalEstimatedSavings > 0) {
      this.logger.log(
        `  💰 Tổng tiền CẮT LỖ được: ${report.totalEstimatedSavings.toLocaleString('vi-VN')} VNĐ`,
      );
    }
    this.logger.log('======================================================');
  }
}
