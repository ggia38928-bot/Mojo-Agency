import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { OrderTelemetryDto } from './dto/order-telemetry.dto';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  /**
   * Mock data mặc định chạy demo trực tiếp trong bộ nhớ.
   * Bao gồm 3 kịch bản:
   *   1. SKU-001: An toàn (NORMAL - Biên > 5%)
   *   2. SKU-002: Biên mỏng (WARNING - Biên 0% - 5%)
   *   3. SKU-003: SKU bẫy cắt lỗ Mega Sale (CRITICAL - Lỗ ròng / CAC > Biên gộp)
   */
  getInlineMockData(): OrderTelemetryDto[] {
    return [
      {
        skuId: 'SKU-001',
        skuName: 'Ốp Lưng iPhone 15 Pro Premium',
        revenue: 450000,
        cogs: 120000,
        adSpend: 45000,
        unitsSold: 3,
        voucherShop: 15000,
        voucherXtraApplied: false,
        campaignId: 'CAMP-001',
        timestamp: '2026-09-25T08:00:00',
      },
      {
        skuId: 'SKU-002',
        skuName: 'Tai Nghe Bluetooth V5.3',
        revenue: 350000,
        cogs: 230000,
        adSpend: 40000,
        unitsSold: 2,
        voucherShop: 10000,
        voucherXtraApplied: true,
        campaignId: 'CAMP-002',
        timestamp: '2026-09-25T08:05:00',
      },
      {
        skuId: 'SKU-003',
        skuName: 'Bộ Sạc Nhanh 20W (SKU Mega Sale ⚡)',
        revenue: 350000,
        cogs: 270000,
        adSpend: 85000,
        unitsSold: 1,
        voucherShop: 20000,
        voucherXtraApplied: true,
        campaignId: 'CAMP-003',
        timestamp: '2026-09-25T08:10:00',
      },
    ];
  }

  /**
   * Đọc dữ liệu telemetry từ file CSV Shopee mock data.
   */
  loadTelemetryFromCsv(filePath?: string): OrderTelemetryDto[] {
    const targetPath =
      filePath ||
      path.resolve(process.cwd(), '../../Mojo-Agency/mock_shopee_orders.csv');

    if (!fs.existsSync(targetPath)) {
      this.logger.warn(`Không tìm thấy file CSV tại ${targetPath}, fallback về inline mock data`);
      return this.getInlineMockData();
    }

    const content = fs.readFileSync(targetPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const headers = lines[0].split(',').map((h) => h.trim());

    const records: OrderTelemetryDto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      records.push({
        skuId: row['sku_id'],
        skuName: row['sku_name'],
        revenue: parseFloat(row['revenue']),
        cogs: parseFloat(row['cogs']),
        adSpend: parseFloat(row['ad_spend']),
        unitsSold: parseInt(row['units_sold'], 10),
        voucherShop: parseFloat(row['voucher_shop'] || '0'),
        voucherXtraApplied: (row['voucher_xtra_applied'] || '').toLowerCase() === 'true',
        campaignId: row['campaign_id'] || undefined,
        timestamp: row['timestamp'] || undefined,
      });
    }

    return records;
  }

  /**
   * Async generator mô phỏng streaming telemetry real-time
   */
  async *streamTelemetry(
    records: OrderTelemetryDto[],
    delayMs: number = 200,
  ): AsyncGenerator<OrderTelemetryDto, void, unknown> {
    for (const record of records) {
      yield record;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
