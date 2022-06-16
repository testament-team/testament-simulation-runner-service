import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import chalk from "chalk";
import { MultiError } from "src/util/multi.error";
import { ArtifactRepositoryException } from "../exceptions/artifact-repository.exception";
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
        console.log("Received simulation with run ID: " + chalk.blue(event.runId));
        console.log(`Publishing simulation status changed event: ${chalk.yellow("running")}`);
        await this.eventBus.publishSimulationStatusChangedEvent({
            runId: event.runId,
            status: SimulationStatus.RUNNING,
            time: new Date()
        });
        console.log("Published");
        console.log("Running simulation...");
        await this.runSimulation(event)
            .then(_ => this.saveArtifacts()
                    .then(artifactsId => this.publishCompletedStatus(event.runId, artifactsId, options),
                        err => this.publishFailedStatus(event.runId, err)), 
                err => this.saveArtifacts()
                    .then(_ => this.publishFailedStatus(event.runId, err),
                        err2 => this.publishFailedStatus(event.runId, new MultiError(err, err2))))
            .catch(err => console.error(err));

        console.log("Ready to receive new simulation\n");
    }

    private async runSimulation(event: SimulationStartEvent) {
        await this.runnerService.runSimulation({
            runId: event.runId,
            type: event.type,
            repository: event.repository, 
            args: event.args,
            runCommands: event.runCommands, 
        }, SimulationPaths.SIMULATION_PATH);
    }

    private async saveArtifacts(): Promise<string> {
        console.log(`Saving simulation artifacts...`);
        const artifactsId: string = await this.simulationArtifactsRepository.saveSimulationArtifacts(SimulationPaths.TMP_PATH);
        return artifactsId;
    }

    private async publishCompletedStatus(runId: string, artifactsId: string, eventOptions: EventOptions) {
        console.log(`Publishing simulation status changed event: ${chalk.green("completed")}`);
        await this.eventBus.publishSimulationStatusChangedEvent({
            runId: runId,
            status: SimulationStatus.COMPLETED,
            time: new Date(),
            artifactsId: artifactsId
        });
        console.log("Published");
        eventOptions.ack = true;
    }

    private async publishFailedStatus(runId: string, err: Error) {
        if(err instanceof ArtifactRepositoryException) {
            console.error(err);
        }
        console.log(`Publishing simulation status changed event: ${chalk.red("failed")}`);
        await this.eventBus.publishSimulationStatusChangedEvent({
            runId: runId,
            error: err.message || err + "",
            status: SimulationStatus.FAILED,
            time: new Date()
        });
        console.log("Published");
    }

}