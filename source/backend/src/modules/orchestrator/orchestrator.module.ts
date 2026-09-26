import { Module } from '@nestjs/common';
import { ActionAgentModule } from '../action-agent/action-agent.module';
import { RiskAgentModule } from '../risk-agent/risk-agent.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [TelemetryModule, RiskAgentModule, ActionAgentModule],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
