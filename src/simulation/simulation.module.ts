import { Module } from '@nestjs/common';
import { AmqpModule } from 'src/amqp/amqp.module';
import { Cli } from 'src/util/cli';
import { GitService } from './services/git.service';
import { FileLogger } from './services/logger';
import { RunEventBus } from './services/run.event-bus';
import { SimulationExecutorService } from './services/simulation-executor.service';
import { SimulationRepositoryService } from './services/simulation-repository.service';
import { RunService } from './services/simulation-runner.service';

@Module({
  imports: [AmqpModule],
  controllers: [],
  providers: [SimulationExecutorService, SimulationRepositoryService, 
    RunService, GitService, FileLogger, Cli, RunEventBus],
  exports: [SimulationExecutorService, SimulationRepositoryService, 
    RunService, GitService, FileLogger]
})
export class SimulationModule {}
