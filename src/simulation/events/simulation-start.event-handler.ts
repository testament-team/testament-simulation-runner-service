import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import chalk from "chalk";
import { SimulationStatus } from "../interfaces/simulation.interface";
import { SimulationArtifactsRepository } from "../repositories/simulation-artifacts.repository";
import { SimulationRunnerService } from "../services/simulation-runner.service";
import { SimulationPaths } from "../simulation-paths";
import { EventOptions, RunEventBus, SimulationStartEvent } from "./run.event-bus";

@Injectable()
export class SimulationStartEventHandler implements OnApplicationBootstrap {

    constructor(private eventBus: RunEventBus, private runnerService: SimulationRunnerService,
                private simulationArtifactsRepository: SimulationArtifactsRepository) {

    }

    async onApplicationBootstrap() {
        await this.eventBus.subscribeToSimulationStartEvent((event, options) => this.onSimulationStart(event, options));
    }

    async onSimulationStart(event: SimulationStartEvent, options: EventOptions) {
        console.log("Received simulation with run ID: " + chalk.green(event.runId));
        console.log(`Publishing simulation status changed event: ${chalk.yellow("running")}`);
        await this.eventBus.publishSimulationStatusChangedEvent({
            runId: event.runId,
            status: SimulationStatus.RUNNING,
            time: new Date()
        });
        console.log("Published");
        console.log("Running simulation...");
        let artifactsId: string;
        try {
            await this.runnerService.runSimulation({
                runId: event.runId,
                type: event.type,
                repository: event.repository, 
                args: event.args,
                runCommands: event.runCommands, 
            }, SimulationPaths.SIMULATION_PATH);
            // console.log(`Simulation ${chalk.green("passed")}`);
            console.log("Uploading simulation artifacts...");
            artifactsId = await this.simulationArtifactsRepository.saveSimulationArtifacts(SimulationPaths.TMP_PATH);
        } catch(err) {
            // console.log(chalk.redBright("Error") + `: ${err.message}\n\n`);
            console.log(`Simulation ${chalk.red("failed")}`);
            console.log(`Publishing simulation status changed event: ${chalk.red("failed")}`);
            await this.eventBus.publishSimulationStatusChangedEvent({
                runId: event.runId,
                error: err.message,
                status: SimulationStatus.FAILED,
                time: new Date()
            });
            console.log("Published");
            return;
        }

        console.log(`Publishing simulation status changed event: ${chalk.green("completed")}`);
        await this.eventBus.publishSimulationStatusChangedEvent({
            runId: event.runId,
            status: SimulationStatus.COMPLETED,
            time: new Date(),
            artifactsId: artifactsId
        });
        console.log("Published");
        console.log("Ready to receive new simulation\n");
        options.ack = true;
    }

}