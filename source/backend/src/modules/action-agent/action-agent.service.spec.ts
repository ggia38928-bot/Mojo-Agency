import { Test, TestingModule } from '@nestjs/testing';
import { ActionCommand } from '../../common/enums/action-command.enum';
import { RiskLevel } from '../../common/enums/risk-level.enum';
import { ActionAgentService } from './action-agent.service';

describe('ActionAgentService', () => {
  let service: ActionAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionAgentService],
    }).compile();

    service = module.get<ActionAgentService>(ActionAgentService);
  });

  it('should trigger KILL_CAMPAIGN when risk level is CRITICAL', () => {
    const action = service.decideAction({
      skuId: 'SKU-003',
      skuName: 'Bộ Sạc Nhanh 20W',
      netPnL: -45000,
      netMarginPct: -0.12,
      cac: 85000,
      grossMarginPerUnit: 60000,
      roi: -0.5,
      riskLevel: RiskLevel.CRITICAL,
      reason: 'Lỗ ròng',
    });

    expect(action.command).toBe(ActionCommand.KILL_CAMPAIGN);
    expect(action.estimatedSavings).toBe(45000);
    expect(action.reason).toContain('KILL_CAMPAIGN');
  });

  it('should trigger LOWER_BID_50 when risk level is WARNING', () => {
    const action = service.decideAction({
      skuId: 'SKU-002',
      skuName: 'Tai Nghe Bluetooth',
      netPnL: 8000,
      netMarginPct: 0.02,
      cac: 20000,
      grossMarginPerUnit: 35000,
      roi: 0.2,
      riskLevel: RiskLevel.WARNING,
      reason: 'Biên mỏng',
    });

    expect(action.command).toBe(ActionCommand.LOWER_BID_50);
    expect(action.newBidPrice).toBe(10000); // 20000 * 0.5
    expect(action.reason).toContain('LOWER_BID_50');
  });

  it('should trigger MAINTAIN when risk level is NORMAL', () => {
    const action = service.decideAction({
      skuId: 'SKU-001',
      skuName: 'Ốp Lưng iPhone',
      netPnL: 120000,
      netMarginPct: 0.25,
      cac: 15000,
      grossMarginPerUnit: 55000,
      roi: 2.5,
      riskLevel: RiskLevel.NORMAL,
      reason: 'An toàn',
    });

    expect(action.command).toBe(ActionCommand.MAINTAIN);
    expect(action.reason).toContain('MAINTAIN');
  });
});
