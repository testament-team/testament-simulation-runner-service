import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import chalk from "chalk";
import { emptyDir, ensureDir, readFile, writeFile } from "fs-extra";
import { join } from "path";
import stripAnsi from "strip-ansi";
import { StartSimulationEvent } from "../dtos/run-simulation.dto";
import { Simulation, SimulationStatus } from "../interfaces/simulation.interface";
import { SimulationPaths } from "../simulation-paths";
import { FileLogger } from "./logger";
import { EventOptions, RunEventBus } from "./run.event-bus";
import { SimulationExecutorService } from "./simulation-executor.service";
import { SimulationRepositoryService } from "./simulation-repository.service";

@Injectable()
// TODO: use createReadStream instead of readFile
export class RunService implements OnApplicationBootstrap {

    constructor(private runEventBus: RunEventBus, private repoService: SimulationRepositoryService, 
        private executorService: SimulationExecutorService,
        private simulationLogger: FileLogger) {
        this.simulationLogger.setPath(SimulationPaths.ANSI_LOG_PATH);
    }
    
    async onApplicationBootstrap() {
        await this.runEventBus.subscribeToSimulationStartEvent((event, options) => 
            this.onSimulationStartEvent(event, options));
    }

    async runSimulation(simulation: Simulation, path: string) {
        await ensureDir(path);
        await emptyDir(path);
        await this.simulationLogger.clear();
        const header: string = chalk.whiteBright("~~~~~~~~~~~~~~~~~~~~");
        await this.simulationLogger.info(`${header}\n${chalk.yellow("STARTING SIMULATION")}\n${header}\n\nRun ID: ${chalk.green(simulation.runId)}\nSimulation Type: ${chalk.green(simulation.type)}\n\n`);
        try {                        
            const srcPath: string = join(path, "src");

            const repoUrl: string = this.repoService.getRepoUrl(simulation);            
            await this.simulationLogger.info(`Cloning repository ${chalk.blueBright(repoUrl)} -> ${chalk.cyanBright(srcPath)}\n\n`);
            await this.repoService.fetchSimulation(simulation, srcPath);
    
            await this.simulationLogger.info("Executing simulation run commands...\n\n");
            await this.executeSimulation(simulation, srcPath);
        } catch(err) {
            await this.simulationLogger.error(chalk.redBright("Error") + `: ${err.stack}\n\n`);
            await this.simulationLogger.error(chalk.redBright("SIMULATION FAILED") + " ❌");
            throw err;
        }
        await this.simulationLogger.info(chalk.greenBright("SIMULATION PASSED") + " 🎉");
    }

    async generateNonAnsiLogs(ansiLogPath: string, nonAnsiLogPath: string) {
        const log: string = stripAnsi((await readFile(ansiLogPath)).toString("utf-8"));
        await writeFile(nonAnsiLogPath, log);
    }

    async zipSimulationArtifacts(src: string, dest: string) {
        // await zipFolder(src, dest);
    }

    async uploadSimulationArtifacts(path: string) {
        // await this.artifactsService.upload(simulation.runId, createReadStream(artifactsPath));
    }

    private async onSimulationStartEvent(event: StartSimulationEvent, options: EventOptions): Promise<void> {
        console.log("Received simulation with run ID: " + chalk.green(event.runId));
        console.log(`Publishing simulation status changed event: ${chalk.yellow("running")}`);
        await this.runEventBus.publishSimulationStatusChangedEvent({
            runId: event.runId,
            status: SimulationStatus.RUNNING,
            time: new Date()
        });
        console.log("Published");
        console.log("Running simulation...");
        try {
            await this.runSimulation({
                runId: event.runId,
                type: event.type,
                repository: event.repository, 
                args: event.args,
                runCommands: event.runCommands, 
            }, SimulationPaths.SIMULATION_PATH);
        } catch(err) {
            console.log(chalk.redBright("Error") + `: ${err.message}\n\n`);
            console.log(`Simulation ${chalk.red("failed")}`);
            console.log(`Publishing simulation status changed event: ${chalk.red("failed")}`);
            await this.runEventBus.publishSimulationStatusChangedEvent({
                runId: event.runId,
                error: err.message,
                status: SimulationStatus.FAILED,
                time: new Date()
            });
            console.log("Published");
            return;
        }

        console.log(`Simulation ${chalk.green("passed")}`);
        console.log("Generating non-ANSI logs...");
        await this.generateNonAnsiLogs(SimulationPaths.ANSI_LOG_PATH, SimulationPaths.LOG_PATH);

        const zippedArtifactsPath: string = join(SimulationPaths.SIMULATION_PATH, "artifacts.zip");
        console.log(`Zippping simulation artifacts ${chalk.blueBright(SimulationPaths.TMP_PATH)} -> ${chalk.cyanBright(zippedArtifactsPath)}`);
        await this.zipSimulationArtifacts(SimulationPaths.TMP_PATH, zippedArtifactsPath);

        console.log("Uploading artifacts...");
        await this.uploadSimulationArtifacts(zippedArtifactsPath);

        console.log(`Publishing simulation status changed event: ${chalk.green("completed")}`);
        await this.runEventBus.publishSimulationStatusChangedEvent({
            runId: event.runId,
            status: SimulationStatus.COMPLETED,
            time: new Date()
        });
        console.log("Published");
        console.log("Ready to receive new simulation\n");

        options.ack = true;
    }

    private async executeSimulation(simulation: Simulation, path: string) {
        await new Promise(async (resolve, reject) => {
            // TODO: change to --simulation-path
            const extraArgs: string = `--simulationPath ${SimulationPaths.SIMULATION_PATH}`;
            this.executorService.executeSimulation(simulation, path, extraArgs)
                .on("command", async (index: number, command: string) => {
                    const coloredIndex: string = chalk.magentaBright(index + ")");
                    await this.simulationLogger.info(`${coloredIndex} ${chalk.bold(command)}\n\n`);
                })
                .on("command-data", async (data, out) => { 
                    if(out === "stdout") {
                        await this.simulationLogger.info(data);
                    } else {
                        await this.simulationLogger.error(data);
                    }
                })
                .on("command-exit", async code => {
                    if(code != 0) {
                        await this.simulationLogger.info("\nEXIT CODE: " + code);
                    } else {
                        await this.simulationLogger.info("\nEXIT CODE: " + code + "\n\n");
                    }
                })
                .on("error", err => reject(err))
                .on("done", () => resolve());
        });
    }

}