import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Channel, ConsumeMessage } from "amqplib";
import { Repository, SimulationStatus, SimulationType } from "../interfaces/simulation.interface";

export interface SimulationStartEvent {
    runId: string;
    type: SimulationType;
    repository: Repository;
    runCommands: string[];
    args: string;
}

export interface SimulationStatusChangedEvent {
    runId: string;
    status: SimulationStatus;
    error?: string;
    time: Date;
    artifactsId?: string;
}

export interface EventOptions {
    ack?: boolean;
    requeue?: boolean;
}

export interface EventHandler<T> {
    (event: T, options?: EventOptions): void | Promise<void>;
}

export const RUN_EXCHANGE = "run.exchange";
export const SIMULATION_START_QUEUE = "run.simulation.start.queue";
export const SIMULATION_START_ROUTING_KEY = "run.simulation.start";
export const SIMULATION_STATUS_CHANGED_QUEUE = "run.simulation.status.changed.queue";

@Injectable()
export class RunEventBus implements OnModuleInit {
    
    constructor(@Inject("AmqpChannel") private channel: Channel) {
        
    }

    async onModuleInit() {
        try {
            await this.channel.prefetch(1);
            await this.channel.assertExchange(RUN_EXCHANGE, "topic", { durable: true });

            await this.channel.assertQueue(SIMULATION_START_QUEUE, { durable: true });
            await this.channel.bindQueue(SIMULATION_START_QUEUE, RUN_EXCHANGE, SIMULATION_START_ROUTING_KEY);
    
            await this.channel.assertQueue(SIMULATION_STATUS_CHANGED_QUEUE, { durable: true });
            await this.channel.bindQueue(SIMULATION_STATUS_CHANGED_QUEUE, RUN_EXCHANGE, "run.simulation.status.*");
        } catch(err) {
            console.error(err);
        }
    }

    async subscribeToSimulationStartEvent(handler: EventHandler<SimulationStartEvent>) {
        await this.channel.consume(SIMULATION_START_QUEUE, async msg => this.consume(msg, handler), { noAck: false });
    }

    async publishSimulationStatusChangedEvent(event: SimulationStatusChangedEvent) {
        await this.channel.publish(RUN_EXCHANGE, `run.simulation.status.${event.status}`, Buffer.from(JSON.stringify(event)), { persistent: true });
    }
    
    private async consume<T>(msg: ConsumeMessage, handler: EventHandler<T>) {
        const eventOptions: EventOptions = { ack: false, requeue: false };
        try {
            await handler(this.parseMessage(msg), eventOptions);
        } catch(err) {
            console.error("Error: " + err.stack);
            await this.channel.nack(msg, false, eventOptions.requeue);
            return;
        }
        if(eventOptions.ack) {
            await this.channel.ack(msg);
        } else {
            await this.channel.nack(msg, false, eventOptions.requeue);
        }
    }

    private parseMessage(msg: ConsumeMessage): any {
        return JSON.parse(msg.content.toString("utf-8"));
    }

}