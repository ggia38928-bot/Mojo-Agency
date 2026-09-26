import { Module } from '@nestjs/common';
import { ActionAgentService } from './action-agent.service';

@Module({
  providers: [ActionAgentService],
  exports: [ActionAgentService],
})
export class ActionAgentModule {}
