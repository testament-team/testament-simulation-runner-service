import { Injectable } from "@nestjs/common";
import chalk from "chalk";
import { emptyDir, ensureDir, readFile, writeFile } from "fs-extra";
import stripAnsi from "strip-ansi";
import { Simulation } from "../interfaces/simulation.interface";
import { SimulationPaths } from "../simulation-paths";
import { FileLogger, LoggerFactory } from "./logger";
import { SimulationExecutorService } from "./simulation-executor.service";
import { SimulationRepositoryService } from "./simulation-repository.service";

// TODO: use createReadStream instead of readFile
@Injectable()
export class SimulationRunnerService {

    constructor(private repoService: SimulationRepositoryService, private executorService: SimulationExecutorService,
                private loggerFactory: LoggerFactory) {
    }

    async runSimulation(simulation: Simulation, path: string) {
        const nonAnsiLogPath: string = SimulationPaths.log(path);
        const ansiLogPath: string = SimulationPaths.ansiLog(path);
        const logger: FileLogger = this.loggerFactory.getFileLogger(ansiLogPath);
        await ensureDir(path);
        await emptyDir(path);
        await logger.clear();
        const header: string = chalk.whiteBright("~~~~~~~~~~~~~~~~~~~~");
        await logger.info(`${header}\n${chalk.yellow("STARTING SIMULATION")}\n${header}\n\nRun ID: ${chalk.green(simulation.runId)}\nSimulation Type: ${chalk.green(simulation.type)}\n\n`);
        try {                        
            const srcPath: string = SimulationPaths.src(path);
            const repoUrl: string = this.repoService.getRepoUrl(simulation);            
            await logger.info(`Cloning repository ${chalk.blueBright(repoUrl)} -> ${chalk.cyanBright(srcPath)}\n\n`);
            await this.repoService.fetchSimulation(simulation, srcPath);
    
            await logger.info("Executing simulation run commands...\n\n");
            await this.executeSimulation(simulation, path, logger);
        } catch(err) {
            await logger.error(chalk.redBright("Error") + `: ${err.stack}\n\n`);
            await logger.error(chalk.redBright("SIMULATION FAILED") + " ❌");
            throw err;
        }
        await logger.info(chalk.greenBright("SIMULATION PASSED") + " 🎉");

        const log: string = stripAnsi((await readFile(ansiLogPath)).toString("utf-8"));
        await writeFile(nonAnsiLogPath, log);
    }

    private async executeSimulation(simulation: Simulation, path: string, logger: FileLogger) {
        await new Promise(async (resolve, reject) => {
            // TODO: change to --simulation-path
            const extraArgs: string = `--simulationPath ${path}`;
            this.executorService.executeSimulation(simulation, SimulationPaths.src(path), extraArgs)
                .on("command", async (index: number, command: string) => {
                    const coloredIndex: string = chalk.magentaBright(index + ")");
                    await logger.info(`${coloredIndex} ${chalk.bold(command)}\n\n`);
                })
                .on("command-data", async (data, out) => { 
                    if(out === "stdout") {
                        await logger.info(data);
                    } else {
                        await logger.error(data);
                    }
                })
                .on("command-exit", async code => {
                    if(code != 0) {
                        await logger.info("\nEXIT CODE: " + code);
                    } else {
                        await logger.info("\nEXIT CODE: " + code + "\n\n");
                    }
                })
                .on("error", err => reject(err))
                .on("done", () => resolve(null));
        });
    }

}