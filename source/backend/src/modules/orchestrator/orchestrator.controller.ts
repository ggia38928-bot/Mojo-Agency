import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TelemetryService } from '../telemetry/telemetry.service';
import { OrderTelemetryDto } from '../telemetry/dto/order-telemetry.dto';
import { OrchestratorReportDto } from './dto/orchestrator-report.dto';
import { OrchestratorService } from './orchestrator.service';

class RunPipelineRequestDto {
  useCsv?: boolean;
  customTelemetry?: OrderTelemetryDto[];
}

@ApiTags('Orchestrator - Multi-Agent Engine')
@Controller('api/orchestrator')
export class OrchestratorController {
  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chạy chu kỳ Multi-Agent bảo vệ P&L',
    description:
      'Kích hoạt pipeline: Telemetry Agent -> Risk Threshold Agent -> Autonomous Action Agent và trả về báo cáo tổng hợp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo can thiệp và phân tích hoàn tất',
    type: OrchestratorReportDto,
  })
  async run(
    @Body() body: RunPipelineRequestDto,
  ): Promise<OrchestratorReportDto> {
    return this.orchestratorService.runPipeline(
      body.useCsv,
      body.customTelemetry,
    );
  }

  @Get('demo')
  @ApiOperation({
    summary: 'Chạy nhanh demo với 3 SKU chuẩn (Normal, Warning, Critical)',
  })
  @ApiQuery({ name: 'csv', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: OrchestratorReportDto })
  async runDemo(@Query('csv') csv?: string): Promise<OrchestratorReportDto> {
    const useCsv = csv === 'true' || csv === '1';
    return this.orchestratorService.runPipeline(useCsv);
  }

  @Get('mock-data')
  @ApiOperation({ summary: 'Lấy danh sách dữ liệu mock Shopee telemetry' })
  @ApiResponse({ status: 200, type: [OrderTelemetryDto] })
  getMockData(): OrderTelemetryDto[] {
    return this.telemetryService.getInlineMockData();
  }
}
