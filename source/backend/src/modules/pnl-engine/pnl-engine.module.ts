import { Module } from '@nestjs/common';
import { PnlEngineService } from './pnl-engine.service';

@Module({
  providers: [PnlEngineService],
  exports: [PnlEngineService],
})
export class PnlEngineModule {}
