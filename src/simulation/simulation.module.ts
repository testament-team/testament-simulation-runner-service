import { Module } from '@nestjs/common';
import { AmqpModule } from 'src/amqp/amqp.module';
import { S3Module } from 'src/s3/s3.module';
import { Cli } from 'src/util/cli';
import { RunEventBus } from './events/run.event-bus';
import { SimulationStartEventHandler } from './events/simulation-start.event-handler';
import { SimulationArtifactsRepository } from './repositories/simulation-artifacts.repository';
import { GitService } from './services/git.service';
import { LoggerFactory } from './services/logger';
import { SimulationExecutorService } from './services/simulation-executor.service';
import { SimulationRepositoryService } from './services/simulation-repository.service';
import { SimulationRunnerService } from './services/simulation-runner.service';

@Module({
  imports: [AmqpModule, S3Module],
  controllers: [],
  providers: [SimulationExecutorService, SimulationRepositoryService, 
    SimulationRunnerService, GitService, LoggerFactory, Cli, RunEventBus, SimulationArtifactsRepository, SimulationStartEventHandler],
  exports: [SimulationExecutorService, SimulationRepositoryService, 
    SimulationRunnerService, GitService, LoggerFactory]
})
export class SimulationModule {}
