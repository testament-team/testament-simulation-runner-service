import { suite, test } from "mocha-typescript";
import { deepEqual, instance, mock, verify } from "ts-mockito";
import { ISimulation } from "../interfaces/simulation.interface";
import { GitService } from "./git.service";
import { SimulationRepositoryService } from "./simulation-repository.service";

@suite
export class SimulationRepositoryServiceTests {

    private simulationRepositoryService: SimulationRepositoryService;
    private gitServiceMock: GitService = mock(GitService);

    before() {
        this.simulationRepositoryService = new SimulationRepositoryService(instance(this.gitServiceMock));
    }

    @test
    async testFetchSimulation() {
        const simulation: ISimulation = {
            repository: {
                git: {
                    url: "http://path-to-repo",
                    username: "username",
                    password: "password"
                }
            },
            scripts: null
        };
        await this.simulationRepositoryService.fetchSimulation(simulation, "/path/to/folder");
        
        verify(this.gitServiceMock.cloneRepository(deepEqual({
            url: "http://path-to-repo",
            username: "username",
            password: "password"
        })));
    }

}