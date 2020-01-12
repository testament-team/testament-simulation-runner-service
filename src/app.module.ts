import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [SimulationModule],
  controllers: [AppController],
})
export class AppModule {}
