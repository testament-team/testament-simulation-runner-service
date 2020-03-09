import { Injectable, NotFoundException } from "@nestjs/common";
import * as fs from "fs-extra";
import { createReadStream, Stats } from "fs-extra";
import { tmpdir } from "os";
import { extname, join } from "path";
import { Readable } from "stream";
import { RunSimulationDTO } from "../dtos/run-simulation.dto";
import { IHar } from "../interfaces/har.interface";
import { IScreenshot } from "../interfaces/screenshot.interface";
import { ISimulation } from "../interfaces/simulation.interface";
import { IAction } from "../interfaces/action.interface";
import { FileLogger } from "./logger";
import { SimulationExecutorService } from "./simulation-executor.service";
import { SimulationRepositoryService } from "./simulation-repository.service";

@Injectable()
// TODO: use createReadStream instead of readFile
export class SimulationRunnerService {

    private simulation: ISimulation;
    private simulationPath: string;
    private logPath: string;
    private harPath: string;
    private actionsPath: string;
    private screenshotsPath: string;

    constructor(private repoService: SimulationRepositoryService, private executionService: SimulationExecutorService,
        private logger: FileLogger) {
        this.simulationPath = join(tmpdir(), "testment_simulation");
        console.debug(this.simulationPath);
        this.logPath = join(this.simulationPath, "tmp", "log.txt");
        this.harPath = join(this.simulationPath, "tmp", "recording.har");
        this.actionsPath = join(this.simulationPath, "tmp", "actions.json");
        this.screenshotsPath = join(this.simulationPath, "tmp", "screenshots");
        this.logger.setPath(this.logPath);
    }

    async runSimulation(dto: RunSimulationDTO): Promise<ISimulation> {
        if(this.simulation && this.simulation.status && this.simulation.status.value === "running") {
            throw new Error("A simulation is currently running");
        }
        const simulation: ISimulation = { 
            repository: dto.repository, 
            args: dto.args,
            scripts: dto.scripts, 
        };

        await fs.ensureDir(this.simulationPath);
        await fs.emptyDir(this.simulationPath);

        await this.repoService.fetchSimulation(simulation, this.simulationPath);

        await this.logger.clear();
        await this.executionService.executeSimulation(simulation, this.simulationPath, this.logger);

        return this.simulation = simulation;
    }

    getSimulation(): ISimulation {
        return this.simulation;
    }

    async getLog(): Promise<Readable> {
        if(await fs.pathExists(this.logPath)) {
            return createReadStream(this.logPath);
        }
        return null;
    }

    async getHar(): Promise<IHar> {
        if(await fs.pathExists(this.harPath)) {
            return fs.readJSON(this.harPath);
        } 
        throw new NotFoundException("Har file not found");
    }

    async getActions(): Promise<IAction[]> {
        if(await fs.pathExists(this.actionsPath)) {
            return fs.readJSON(this.actionsPath);
        } 
        return [];
    }

    async getScreenshots(): Promise<IScreenshot[]> {
        const screenshots: IScreenshot[] = [];
        if(await fs.pathExists(this.screenshotsPath)) {
            const files: string[] = await fs.readdir(this.screenshotsPath);
            for(const f of files) {
                const stats: Stats = await fs.lstat(join(this.screenshotsPath, f));
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
        if(await fs.pathExists(join(this.screenshotsPath, name))) {
            return fs.createReadStream(join(this.screenshotsPath, name));    
        }
        throw new NotFoundException(`Screenshot ${name} not found`);
    }

}