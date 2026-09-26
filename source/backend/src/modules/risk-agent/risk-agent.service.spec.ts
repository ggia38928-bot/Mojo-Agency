import { Test, TestingModule } from '@nestjs/testing';
import { RiskLevel } from '../../common/enums/risk-level.enum';
import { PnlEngineModule } from '../pnl-engine/pnl-engine.module';
import { RiskAgentService } from './risk-agent.service';

describe('RiskAgentService', () => {
  let service: RiskAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PnlEngineModule],
      providers: [RiskAgentService],
    }).compile();

    service = module.get<RiskAgentService>(RiskAgentService);
  });

  it('should classify NORMAL risk when net margin is >= 5% and CAC is controlled', () => {
    const result = service.analyzeRisk({
      skuId: 'SKU-SAFE',
      skuName: 'Ốp Lưng iPhone',
      revenue: 500_000,
      cogs: 150_000,
      adSpend: 20_000,
      unitsSold: 5,
      voucherShop: 0,
      voucherXtraApplied: false,
    });

    expect(result.riskLevel).toBe(RiskLevel.NORMAL);
    expect(result.reason).toContain('An toàn');
  });

  it('should classify CRITICAL risk when Net P&L < 0 or CAC > Gross Margin', () => {
    const result = service.analyzeRisk({
      skuId: 'SKU-003',
      skuName: 'Bộ Sạc Nhanh 20W (Mega Sale)',
      revenue: 350_000,
      cogs: 270_000,
      adSpend: 85_000,
      unitsSold: 1,
      voucherShop: 20_000,
      voucherXtraApplied: true,
    });

    expect(result.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(result.reason).toContain('Lỗ ròng');
  });

  it('should classify WARNING risk when net margin is between 0% and 5%', () => {
    // 500k revenue, 350k cogs, 45k adSpend, 20k voucherShop
    // fees = 500k * 12.91% = 64,550
    // netPnL = 500k - 350k - 64.55k - 45k - 20k = 20,450 (~4.09%)
    const result = service.analyzeRisk({
      skuId: 'SKU-WARN',
      skuName: 'Tai Nghe Bluetooth',
      revenue: 500_000,
      cogs: 350_000,
      adSpend: 45_000,
      unitsSold: 5,
      voucherShop: 20_000,
      voucherXtraApplied: false,
    });

    expect(result.riskLevel).toBe(RiskLevel.WARNING);
    expect(result.reason).toContain('Biên mỏng');
  });
});
