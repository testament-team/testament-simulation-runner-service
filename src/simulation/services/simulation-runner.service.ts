import { Injectable } from "@nestjs/common";
import * as fs from "fs-extra";
import { createReadStream, Stats } from "fs-extra";
import { extname, join } from "path";
import { ResourceNotFoundException } from "src/exceptions/resource-not-found.exception";
import { dateTimeReviver } from "src/util/date.util";
import { Readable } from "stream";
import { RunSimulationDTO } from "../dtos/run-simulation.dto";
import { SimulationLimitReachedException } from "../exceptions/simulation-limit-reached.exception";
import { IAction } from "../interfaces/action.interface";
import { IHar } from "../interfaces/har.interface";
import { IScreenshot } from "../interfaces/screenshot.interface";
import { ISimulation } from "../interfaces/simulation.interface";
import { SimulationPaths } from "../simulation-paths";
import { FileLogger } from "./logger";
import { SimulationExecutorService } from "./simulation-executor.service";
import { SimulationRepositoryService } from "./simulation-repository.service";

@Injectable()
// TODO: use createReadStream instead of readFile
export class SimulationRunnerService {

    private simulation: ISimulation;

    constructor(private repoService: SimulationRepositoryService, private executionService: SimulationExecutorService,
        private logger: FileLogger) {
        console.debug(SimulationPaths.SIMULATION_PATH);
        this.logger.setPath(SimulationPaths.LOG_PATH);
    }

    async runSimulation(dto: RunSimulationDTO): Promise<ISimulation> {
        if(this.simulation && this.simulation.status && this.simulation.status.value === "running") {
            throw new SimulationLimitReachedException("A simulation is currently running");
        }
        const simulation: ISimulation = { 
            repository: dto.repository, 
            args: dto.args,
            scripts: dto.scripts, 
        };

        await fs.ensureDir(SimulationPaths.SIMULATION_PATH);
        await fs.emptyDir(SimulationPaths.SIMULATION_PATH);

        // TODO: make this async?
        await this.repoService.fetchSimulation(simulation, SimulationPaths.SIMULATION_PATH);
        await this.logger.clear();
        
        this.executionService.executeSimulation(simulation, SimulationPaths.SIMULATION_PATH, this.logger)
            .catch(err => console.error(err));

        return this.simulation = simulation;
    }

    getSimulation(): ISimulation | {} {
        if(this.simulation)
            return this.simulation;
        return {};
    }

    async getLog(): Promise<Readable> {
        if(await fs.pathExists(SimulationPaths.LOG_PATH)) {
            return createReadStream(SimulationPaths.LOG_PATH);
        }
        return null;
    }

    async getHar(): Promise<IHar> {
        if(await fs.pathExists(SimulationPaths.HAR_PATH)) {
            return fs.readJSON(SimulationPaths.HAR_PATH);
        } 
        throw new ResourceNotFoundException("Har file not found");
    }

    async getActions(): Promise<IAction[]> {
        if(await fs.pathExists(SimulationPaths.ACTIONS_PATH)) {
            const actions: IAction[] = await fs.readJSON(SimulationPaths.ACTIONS_PATH, { reviver: dateTimeReviver });
            return actions;
        } 
        return [];
    }

    async getScreenshots(): Promise<IScreenshot[]> {
        const screenshots: IScreenshot[] = [];
        if(await fs.pathExists(SimulationPaths.SCREENSHOTS_PATH)) {
            const files: string[] = await fs.readdir(SimulationPaths.SCREENSHOTS_PATH);
            for(const f of files) {
                const stats: Stats = await fs.lstat(join(SimulationPaths.SCREENSHOTS_PATH, f));
                if(stats.isFile() && extname(f) === ".png") {
                    screenshots.push({
                        name: f,
                        taken: stats.ctime
                    });
                }
            }        
        }
        return screenshots;
    }

    async getScreenshot(name: string): Promise<Readable> {
        if(await fs.pathExists(join(SimulationPaths.SCREENSHOTS_PATH, name))) {
            return fs.createReadStream(join(SimulationPaths.SCREENSHOTS_PATH, name));    
        }
        throw new ResourceNotFoundException(`Screenshot ${name} not found`);
    }

}