import * as chai from "chai";
import { assert } from "chai";
import chaiAsPromised from 'chai-as-promised';
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { tmpdir } from "os";
import { join } from "path";
import { ResourceNotFoundException } from "src/exceptions/resource-not-found.exception";
import { sleep } from "src/util/async.util";
import { streamToBuffer } from "src/util/stream.util";
import { Readable } from "stream";
import { anyString, anything, instance, mock, verify, when } from "ts-mockito";
import { RunSimulationDTO } from "../dtos/run-simulation.dto";
import { IAction } from "../interfaces/action.interface";
import { IHar } from "../interfaces/har.interface";
import { IScreenshot } from "../interfaces/screenshot.interface";
import { ISimulation } from "../interfaces/simulation.interface";
import { SimulationPaths } from "../simulation-paths";
import { FileLogger } from "./logger";
import { SimulationExecutorService } from "./simulation-executor.service";
import { SimulationRepositoryService } from "./simulation-repository.service";
import { SimulationRunnerService } from "./simulation-runner.service";

@suite
export class SimulationRunnerServiceTests {

    private runnerService: SimulationRunnerService; 
    private repoServiceMock: SimulationRepositoryService = mock(SimulationRepositoryService);
    private executorServiceMock: SimulationExecutorService = mock(SimulationExecutorService);
    private loggerMock: FileLogger = mock(FileLogger);
    private tempFolder: string = tmpdir();

    async before() {
        chai.use(chaiAsPromised);
        await fs.remove(SimulationPaths.SIMULATION_PATH);
        when(this.executorServiceMock.executeSimulation(anything(), anyString(), anything())).thenCall((sim) => {
            sim.status = { value: "running" };
            return Promise.resolve();
        });
        when(this.loggerMock.info).thenCall(msg => console.log(msg));
        when(this.loggerMock.error).thenCall(msg => console.error(msg));
        this.runnerService = new SimulationRunnerService(instance(this.repoServiceMock), instance(this.executorServiceMock), instance(this.loggerMock));
    }

    async after() {
        await fs.remove(SimulationPaths.SIMULATION_PATH);
    }

    @test
    async testRunSimulation() {
        const dto: RunSimulationDTO = {
            repository: {
                git: {
                    url: "http://path-to-repo",
                    username: "username",
                    password: "password"
                }
            },
            args: "--arg1 value 1 --arg2",
            scripts: []
        };

        assert.deepEqual(this.runnerService.getSimulation(), {});

        const sim: ISimulation = await this.runnerService.runSimulation(dto);
        const expectedSim: ISimulation = {
            repository: dto.repository,
            args: dto.args,
            scripts: [],
            status: {
                value: "running"
            }
        };

        assert.deepEqual(sim, expectedSim);
        assert.deepEqual(this.runnerService.getSimulation(), expectedSim);

        const expectedSimPath: string = SimulationPaths.SIMULATION_PATH;
        assert.isEmpty(fs.readdirSync(expectedSimPath), `Expected directory to be empty: ${expectedSimPath}`);
    
        verify(this.repoServiceMock.fetchSimulation(anything(), expectedSimPath)).once();
        verify(this.loggerMock.clear()).once();
        verify(this.executorServiceMock.executeSimulation(anything(), expectedSimPath, this.loggerMock));
    }

    @test
    async testFailToRunSimulationIfAlreadyRunning() {
        await this.runnerService.runSimulation(new RunSimulationDTO());
        const promise: Promise<ISimulation> = this.runnerService.runSimulation(new RunSimulationDTO());
        await assert.isRejected(promise, /simulation is currently running/);
    }

    @test
    async testGetLog() {
        const logPath: string = SimulationPaths.LOG_PATH;
        fs.mkdirpSync(SimulationPaths.TMP_PATH);
        fs.writeFileSync(logPath, "test123");
        const log: Readable = await this.runnerService.getLog();
        assert.deepEqual(await streamToBuffer(log), Buffer.from("test123"));
    }

    @test
    async testGetLogIfNotFound() {
        assert.isNull(await this.runnerService.getLog());
    }

    @test
    async testGetHar() {
        const harPath: string = SimulationPaths.HAR_PATH;
        fs.mkdirpSync(SimulationPaths.TMP_PATH);
        fs.writeFileSync(harPath, JSON.stringify({ key: "value" }));
        const har: IHar = await this.runnerService.getHar();
        assert.deepEqual(await har, { key: "value" });
    }

    @test
    async testGetHarIfNotFound() {
        await assert.isRejected(this.runnerService.getHar(), ResourceNotFoundException);
    }

    @test
    async testGetActions() {
        const actionsPath: string = SimulationPaths.ACTIONS_PATH;
        fs.mkdirpSync(SimulationPaths.TMP_PATH);
        fs.writeFileSync(actionsPath, JSON.stringify([{ 
            name: "action-1",
            date: 0,
            state: "start"
        }], null, 4));

        const actualActions: IAction[] = await this.runnerService.getActions();
        
        assert.deepEqual(await actualActions, [
            { 
                name: "action-1",
                date: new Date(0),
                state: "start"
            }
        ]);
    }

    @test
    async testGetActionsIfNotFound() {
        const actions: IAction[] = await this.runnerService.getActions();
        assert.deepEqual(actions, []);
    }

    @test
    async testGetScreenshots() {
        const screenshotsPath: string = SimulationPaths.SCREENSHOTS_PATH;
        fs.mkdirpSync(screenshotsPath);
        fs.writeFileSync(join(screenshotsPath, "screenshot-1.png"), "");
        fs.writeFileSync(join(screenshotsPath, "screenshot-2.jpeg"), "");
        await sleep(1); // Sleep so that screenshot-1.png's creation date is before screenshot-3.png
        fs.writeFileSync(join(screenshotsPath, "screenshot-3.png"), "");
        const screenshots: IScreenshot[] = await this.runnerService.getScreenshots();
        assert.lengthOf(screenshots, 2);
        assert.equal(screenshots[0].name, "screenshot-1.png");
        assert.equal(screenshots[1].name, "screenshot-3.png");
        assert.isBelow(screenshots[0].taken.getTime(), screenshots[1].taken.getTime());
    }

    @test
    async testGetScreenshotsIfNotFound() {
        const screenshots: IScreenshot[] = await this.runnerService.getScreenshots();
        assert.deepEqual(screenshots, []);
    }

    @test
    async testGetScreenshot() {
        const screenshotsPath: string = SimulationPaths.SCREENSHOTS_PATH;
        fs.mkdirpSync(screenshotsPath);
        fs.writeFileSync(join(screenshotsPath, "screenshot.png"), "this is a screenshot");
        const readable: Readable = await this.runnerService.getScreenshot("screenshot.png");
        assert.isNotNull(readable);
        assert.deepEqual((await streamToBuffer(readable)).toString(), "this is a screenshot");
    }
    
    @test
    async testFailToGetScreenshotIfNotFound() {
        assert.isRejected(this.runnerService.getScreenshot("screenshot.png"), ResourceNotFoundException);
    }
    
}