import { Injectable } from "@nestjs/common";
import { ISimulation } from "../interfaces/simulation.interface";
import { SimulationRepositoryType } from "../simulation-repository-type";
import { GitService } from "./git.service";

@Injectable()
export class SimulationRepositoryService {

    constructor(private gitService: GitService) {
        
    }

    async fetchSimulation(simulation: ISimulation, path: string) {
        const repoType: string = SimulationRepositoryType.GIT;
        switch(repoType) {
            case SimulationRepositoryType.GIT:
                await this.gitService.cloneRepository({ 
                    url: simulation.repository.git.url,
                    username: simulation.repository.git.username,
                    password: simulation.repository.git.password,
                }, path);
                break;
            default:
                throw new Error(`Unsupported repository type: ${repoType}`);
        }
        // TODO: set simulation type
    }

}