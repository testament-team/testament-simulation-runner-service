import { Module } from '@nestjs/common';
import { amqpProviders } from './amqp.providers';

@Module({
    providers: amqpProviders,
    exports: amqpProviders
})
export class AmqpModule {}
