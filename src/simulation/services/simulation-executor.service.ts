import { Injectable } from "@nestjs/common";
import { EventEmitter } from "events";
import { env } from "process";
import { Cli, Command } from "src/util/cli";
import { Simulation } from "../interfaces/simulation.interface";

@Injectable()
export class SimulationExecutorService {

    constructor(private cli: Cli) {
        
    }

    executeSimulation(simulation: Simulation, path: string, extraArgs?: string): EventEmitter {
        const args: string = simulation.args + " " + extraArgs;
        const eventEmitter: EventEmitter = new EventEmitter();
        process.nextTick(async () => {
            try {
                for(let i = 0; i < simulation.runCommands.length; i++) {
                    const script: string = simulation.runCommands[i].replace(new RegExp("\\$\\{args\\}", "g"), args);
                    eventEmitter.emit("command", i + 1, script);
                    await this.executeSimulationScript(script, args, path, eventEmitter);
                };
                eventEmitter.emit("done");
            } catch(err) {
                eventEmitter.emit("error", err);
            }
        });
        return eventEmitter;
    }

    private async executeSimulationScript(script: string, args: string, path: string, eventEmitter: EventEmitter) {
        const environment: any = Object.assign({}, env);
        const cmd: Command = this.cli.spawn(script, { cwd: path, env: environment, shell: true });

        return new Promise((resolve, reject) => {
            cmd.stdout.on("data", data => {
                eventEmitter.emit("command-data", data.toString(), "stdout");
            });
            cmd.stderr.on("data", async data => {
                eventEmitter.emit("command-data", data.toString(), "stderr");
            });
            cmd.cmd.on("error", async err => {
                reject(err);
            });
            cmd.cmd.on("exit", async code => {
                eventEmitter.emit("command-exit", code);
                if(code != 0) {
                    reject(new Error(`Script '${script}' returned a non-zero exit code: ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

}