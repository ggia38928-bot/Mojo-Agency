import { Module } from '@nestjs/common';
import { PnlEngineModule } from '../pnl-engine/pnl-engine.module';
import { RiskAgentService } from './risk-agent.service';

@Module({
  imports: [PnlEngineModule],
  providers: [RiskAgentService],
  exports: [RiskAgentService],
})
export class RiskAgentModule {}
