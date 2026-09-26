import { Test, TestingModule } from '@nestjs/testing';
import { PnlEngineService } from './pnl-engine.service';

describe('PnlEngineService', () => {
  let service: PnlEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PnlEngineService],
    }).compile();

    service = module.get<PnlEngineService>(PnlEngineService);
  });

  describe('Shopee Fees Calculation', () => {
    it('should calculate 8% commission rate accurately', () => {
      const fees = service.calculateShopeeFees(1_000_000, false);
      expect(fees.commission).toBeCloseTo(80_000);
    });

    it('should calculate 4.91% payment fee accurately (VAT included)', () => {
      const fees = service.calculateShopeeFees(1_000_000, false);
      expect(fees.paymentFee).toBeCloseTo(49_100);
    });

    it('should calculate 4% voucher xtra fee when applied', () => {
      const fees = service.calculateShopeeFees(1_000_000, true);
      expect(fees.voucherXtraFee).toBeCloseTo(40_000);
      expect(fees.totalFees).toBeCloseTo(80_000 + 49_100 + 40_000);
    });

    it('should set voucher xtra fee to 0 when not applied', () => {
      const fees = service.calculateShopeeFees(1_000_000, false);
      expect(fees.voucherXtraFee).toBe(0);
      expect(fees.totalFees).toBeCloseTo(80_000 + 49_100);
    });
  });

  describe('Net P&L Formula', () => {
    it('should produce positive Net P&L for profitable SKU', () => {
      const result = service.calculatePnL({
        skuId: 'SKU-TEST-001',
        skuName: 'Test SKU Profitable',
        revenue: 500_000,
        cogs: 150_000,
        adSpend: 30_000,
        unitsSold: 5,
        voucherShop: 10_000,
        voucherXtraApplied: false,
      });

      expect(result.netPnL).toBeGreaterThan(0);
      expect(result.netMarginPct).toBeGreaterThan(0.05);
      expect(service.getMarginLabel(result.netMarginPct)).toBe('SAFE');
    });

    it('should produce negative Net P&L for Mega Sale trap SKU (SKU-003)', () => {
      const result = service.calculatePnL({
        skuId: 'SKU-003',
        skuName: 'Bộ Sạc Nhanh 20W (SKU Mega Sale)',
        revenue: 350_000,
        cogs: 270_000,
        adSpend: 85_000,
        unitsSold: 1,
        voucherShop: 20_000,
        voucherXtraApplied: true,
      });

      expect(result.netPnL).toBeLessThan(0);
      expect(result.cac).toBe(85_000);
      expect(result.grossMarginPerUnit).toBe(80_000); // (350k - 270k) / 1
      expect(result.cac).toBeGreaterThan(result.grossMarginPerUnit);
      expect(service.getMarginLabel(result.netMarginPct)).toContain('CRITICAL');
    });

    it('should calculate CAC and handle zero units sold gracefully without NaN', () => {
      const result = service.calculatePnL({
        skuId: 'SKU-ZERO',
        skuName: 'Zero Units',
        revenue: 0,
        cogs: 0,
        adSpend: 50_000,
        unitsSold: 0,
      });

      expect(result.cac).toBe(0);
      expect(result.grossMarginPerUnit).toBe(0);
      expect(result.netMarginPct).toBe(0);
    });
  });
});
