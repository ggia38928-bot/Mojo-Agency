import { Module } from '@nestjs/common';
import { PnlEngineModule } from './modules/pnl-engine/pnl-engine.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { RiskAgentModule } from './modules/risk-agent/risk-agent.module';
import { ActionAgentModule } from './modules/action-agent/action-agent.module';
import { OrchestratorModule } from './modules/orchestrator/orchestrator.module';

@Module({
  imports: [
    PnlEngineModule,
    TelemetryModule,
    RiskAgentModule,
    ActionAgentModule,
    OrchestratorModule,
  ],
})
export class AppModule {}
