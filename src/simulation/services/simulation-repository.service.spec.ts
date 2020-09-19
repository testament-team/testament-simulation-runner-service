import { suite, test } from "@testdeck/mocha";
import { deepEqual, instance, mock, verify } from "ts-mockito";
import { RepositoryType, Simulation, SimulationType } from "../interfaces/simulation.interface";
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
        const simulation: Simulation = {
            runId: "r1",
            type: SimulationType.JAVA_CHROMIUM,
            repository: {
                type: RepositoryType.GIT,
                git: {
                    url: "http://path-to-repo",
                    username: "username",
                    password: "password"
                }
            },
            args: null,
            runCommands: null
        };
        await this.simulationRepositoryService.fetchSimulation(simulation, "/path/to/folder");
        
        verify(this.gitServiceMock.cloneRepository(deepEqual({
            url: "http://path-to-repo",
            username: "username",
            password: "password"
        })));
    }

}