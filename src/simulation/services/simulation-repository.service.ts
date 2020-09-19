import { Injectable } from "@nestjs/common";
import { RepositoryType, Simulation } from "../interfaces/simulation.interface";
import { GitService } from "./git.service";

@Injectable()
export class SimulationRepositoryService {

    constructor(private gitService: GitService) {
        
    }

    getRepoUrl(simulation: Simulation): string {
        switch(simulation.repository.type) {
            case RepositoryType.GIT:
                return simulation.repository.git.url;
            default:
                throw new Error(`Unsupported repository type: ${simulation.repository.type}`);
        }
    }


    async fetchSimulation(simulation: Simulation, path: string) {
        switch(simulation.repository.type) {
            case RepositoryType.GIT:
                await this.gitService.cloneRepository({ 
                    url: simulation.repository.git.url,
                    username: simulation.repository.git.username,
                    password: simulation.repository.git.password,
                }, path);
                break;
            default:
                throw new Error(`Unsupported repository type: ${simulation.repository.type}`);
        }
    }

}