import { Injectable } from "@nestjs/common";
import { env } from "process";
import { ILogger } from "src/simulation/services/logger";
import { Cli, ICommand } from "src/util/cli";
import { ISimulation } from "../interfaces/simulation.interface";

@Injectable()
export class SimulationExecutorService {

    constructor(private cli: Cli) {
        
    }

    async executeSimulation(simulation: ISimulation, path: string, logger: ILogger) {
        logger.info("Running simulation scripts\n============================\n\n");
        simulation.status = { value: "running" };
        return this.executeSimulationHelper(simulation, path, logger)
            .then(_ => {
                logger.info("SIMULATION PASSED");
                simulation.status = { value: "passed" };
            }).catch((err: Error) => {
                logger.error("SIMULATION FAILED");
                simulation.status = { value: "failed", errorMessage: err.message };
            });
    }

    private async executeSimulationHelper(simulation: ISimulation, path: string, logger: ILogger) {
        for(let i = 0; i < simulation.scripts.length; i++) {
            const script: string = simulation.scripts[i].replace(new RegExp("\\$\\{args\\}", "g"), simulation.args);
            logger.info(`${i+1}) ${script}\n\n`);
            await this.executeSimulationScript(script, simulation.args, path, logger);
        }
    }

    private async executeSimulationScript(script: string, args: string, path: string, logger: ILogger) {
        const environment: any = Object.assign({}, env);
        const cmd: ICommand = this.cli.spawn(script, { cwd: path, env: environment, shell: true });

        return new Promise((resolve, reject) => {
            cmd.stdout.on("data", async data => {
                try {
                    await logger.info(data.toString());
                } catch(err) {
                    reject(err);
                }
            });
            cmd.stderr.on("data", async data => {
                try {
                    await logger.error(data.toString());
                } catch(err) {
                    reject(err);
                }
            });
            cmd.cmd.on("error", err => {
                logger.error(err.message);
                reject(err);
            });
            cmd.cmd.on("exit", code => {
                logger.info("\nEXIT CODE: " + code + "\n\n");
                if(code != 0) {
                    reject(new Error(`Script '${script}' returned a non-zero exit code: ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

}