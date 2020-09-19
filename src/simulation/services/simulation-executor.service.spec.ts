// import { suite, test } from "@testdeck/mocha";
// import * as chai from "chai";
// import { assert } from "chai";
// import chaiAsPromised from 'chai-as-promised';
// import { SpawnOptionsWithoutStdio } from "child_process";
// import { EventEmitter } from "events";
// import { env, nextTick } from "process";
// import { Cli, ICommand } from "src/util/cli";
// import { anything, capture, instance, match, mock, verify, when } from "ts-mockito";
// import { Simulation } from "../interfaces/simulation.interface";
// import { ILogger } from "./logger";
// import { SimulationExecutorService } from "./simulation-executor.service";


// @suite
// export class SimulationExecutorServiceTests {

//     private simulationExecutionService: SimulationExecutorService;
//     private loggerMock: ILogger = mock<ILogger>();
//     private cliMock: Cli = mock(Cli);

//     before() {
//         chai.use(chaiAsPromised);
//         this.simulationExecutionService = new SimulationExecutorService(instance(this.cliMock));
//     }

//     @test
//     async executeSuccessfulSimulation() {
//         const simulation: Simulation = {
//             repository: null,
//             args: `arg3 arg4 "arg5 arg6"`,
//             runCommands: [
//                 `command1 "arg1 arg2"`,
//                 "command2 ${args}"
//             ]
//         };

//         // Mock spawn.
//         when(this.cliMock.spawn(anything(), anything())).thenCall(() => {
//             // Assert 'running' simulation status.
//             assert.deepEqual(simulation.status, { value: "running" });

//             const cmd: ICommand = { cmd: new EventEmitter(), stdout: new EventEmitter(), stderr: new EventEmitter() };
//             nextTick(() => {
//                 cmd.stdout.emit("data", "log");
//                 cmd.cmd.emit("exit", 0);
//             });
//             return cmd;
//         });

//         // Method under test.
//         await this.simulationExecutionService.executeSimulation(simulation, __filename, instance(this.loggerMock));

//         // Assert 'passed' simulation status.
//         assert.deepEqual(simulation.status, { value: "passed" });

//         // Verify spawn.
//         let script: string, options: SpawnOptionsWithoutStdio;

//         [script, options] = capture(this.cliMock.spawn).first();
//         assert.deepEqual(script, `command1 "arg1 arg2"`);
//         assert.deepEqual(options.cwd, __filename);
//         assert.deepEqual(options.env, env);
//         assert.deepEqual(options.shell, true);
        
//         [script, options] = capture(this.cliMock.spawn).second();
//         assert.deepEqual(script, `command2 arg3 arg4 "arg5 arg6"`);
//         assert.deepEqual(options.cwd, __filename);
//         assert.deepEqual(options.env, env);
//         assert.deepEqual(options.shell, true);

//         // Verify logs.
//         verify(this.loggerMock.info(match("Running simulation scripts"))).once();
//         verify(this.loggerMock.info(match(`1\\) command1 "arg1 arg2"`))).once();
//         verify(this.loggerMock.info(match(`2\\) command2 arg3 arg4 "arg5 arg6"`))).once();
//         verify(this.loggerMock.info(match("log"))).twice();
//         verify(this.loggerMock.info(match("EXIT CODE: 0"))).twice();
//         verify(this.loggerMock.info(match("SIMULATION PASSED"))).once();
//     }

//     @test
//     async executeFailingSimulation() {
//         const simulation: Simulation = {
//             repository: null,
//             args: `arg1 arg2 "arg3 arg4"`,
//             runCommands: [
//                 "command1 ${args}"
//             ]
//         };

//         // Mock spawn.
//         when(this.cliMock.spawn(anything(), anything())).thenCall(() => {
//             // Assert 'running' simulation status.
//             assert.deepEqual(simulation.status, { value: "running" });

//             const cmd: ICommand = { cmd: new EventEmitter(), stdout: new EventEmitter(), stderr: new EventEmitter() };
//             nextTick(() => {
//                 cmd.stderr.emit("data", "log");
//                 cmd.cmd.emit("exit", -1);
//             });
//             return cmd;
//         });

//         // Method under test.
//         await this.simulationExecutionService.executeSimulation(simulation, __filename, instance(this.loggerMock));

//         // Assert 'failed' simulation status.
//         assert.deepEqual(simulation.status.value, "failed");
//         assert.deepEqual(simulation.status.errorMessage, "Script 'command1 arg1 arg2 \"arg3 arg4\"' returned a non-zero exit code: -1");

//         // Verify spawn.
//         const [script, options] = capture(this.cliMock.spawn).first();
//         assert.deepEqual(script, `command1 arg1 arg2 "arg3 arg4"`);
//         assert.deepEqual(options.cwd, __filename);
//         assert.deepEqual(options.env, env);
//         assert.deepEqual(options.shell, true);

//         // Verify logs.
//         verify(this.loggerMock.info(match("Running simulation scripts"))).once();
//         verify(this.loggerMock.info(match(`1\\) command1 arg1 arg2 "arg3 arg4`))).once();
//         verify(this.loggerMock.error(match("log"))).once();
//         verify(this.loggerMock.info(match("EXIT CODE: -1"))).once();
//         verify(this.loggerMock.error(match("SIMULATION FAILED"))).once();
//     }

//     @test
//     async executeCriticallyFailingSimulation() {
//         const simulation: Simulation = {
//             repository: null,
//             args: `arg1 arg2 "arg3 arg4"`,
//             runCommands: [
//                 "command1 ${args}"
//             ]
//         };

//         // Mock spawn.
//         when(this.cliMock.spawn(anything(), anything())).thenCall(() => {
//             // Assert 'running' simulation status.
//             assert.deepEqual(simulation.status, { value: "running" });

//             const cmd: ICommand = { cmd: new EventEmitter(), stdout: new EventEmitter(), stderr: new EventEmitter() };
//             nextTick(() => {
//                 cmd.cmd.emit("error", new Error("test error"));
//             });
//             return cmd;
//         });

//         // Method under test.
//         await this.simulationExecutionService.executeSimulation(simulation, __filename, instance(this.loggerMock));

//         // Assert 'failed' simulation status.
//         assert.deepEqual(simulation.status, { errorMessage: "test error", value: "failed" });

//         // Verify spawn.
//         const [script, options] = capture(this.cliMock.spawn).first();
//         assert.deepEqual(script, `command1 arg1 arg2 "arg3 arg4"`);
//         assert.deepEqual(options.cwd, __filename);
//         assert.deepEqual(options.env, env);
//         assert.deepEqual(options.shell, true);

//         // Verify logs.
//         verify(this.loggerMock.info(match("Running simulation scripts"))).once();
//         verify(this.loggerMock.info(match(`1\\) command1 arg1 arg2 "arg3 arg4`))).once();
//         verify(this.loggerMock.error(match("test error"))).once();
//         verify(this.loggerMock.error(match("SIMULATION FAILED"))).once();
//     }

// }