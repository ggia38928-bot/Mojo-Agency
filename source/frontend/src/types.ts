export type RiskLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type ActionCommand = 'KILL_CAMPAIGN' | 'LOWER_BID_50' | 'MAINTAIN';

export interface PnLAnalysisResult {
  skuId: string;
  skuName: string;
  netPnL: number;
  netMarginPct: number;
  cac: number;
  grossMarginPerUnit: number;
  roi: number;
  riskLevel: RiskLevel;
  reason: string;
}

export interface ActionCommandResult {
  skuId: string;
  campaignId?: string;
  command: ActionCommand;
  reason: string;
  estimatedSavings?: number;
  newBidPrice?: number;
}

export interface OrchestratorReport {
  totalSkus: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
  campaignsKilled: number;
  bidsLowered: number;
  maintained: number;
  totalEstimatedSavings: number;
  analyses: PnLAnalysisResult[];
  actions: ActionCommandResult[];
  executedAt: string;
}

export interface OrderTelemetry {
  skuId: string;
  skuName: string;
  revenue: number;
  cogs: number;
  adSpend: number;
  unitsSold: number;
  voucherShop?: number;
  voucherXtraApplied?: boolean;
  campaignId?: string;
  timestamp?: string;
}
