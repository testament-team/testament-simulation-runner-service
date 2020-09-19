// import { HttpStatus, INestApplication } from '@nestjs/common';
// import { assert } from 'chai';
// import { mkdirp, remove } from 'fs-extra';
// import { suite, test } from "mocha-typescript";
// import { tmpdir } from 'os';
// import { join } from 'path';
// import { ErrorCode } from 'src/error-codes';
// import { ResourceNotFoundException } from 'src/exceptions/resource-not-found.exception';
// import { bufferToStream } from 'src/util/stream.util';
// import { setupControllerTest } from 'src/util/test/nestjs-testing.util';
// import { binaryParser, printError } from "src/util/test/supertest.util";
// import request, { Response } from "supertest";
// import { anyString, anything, instance, mock, verify, when } from "ts-mockito";
// import { SimulationLimitReachedException } from '../exceptions/simulation-limit-reached.exception';
// import { SimulationRunnerService } from '../services/simulation-runner.service';
// import { SimulationModule } from '../simulation.module';

// @suite
// export class SimulationControllerTests {

//     private runnerServiceMock: SimulationRunnerService = mock(SimulationRunnerService);
//     private app: INestApplication;
//     private tempFolder: string = join(tmpdir(), "simulation_controller_tests");

//     async before() {
//         await remove(this.tempFolder);
//         await mkdirp(this.tempFolder);
//         this.app = await setupControllerTest(SimulationModule, (builder) => {
//             builder            
//                 .overrideProvider(SimulationRunnerService)
//                 .useValue(instance(this.runnerServiceMock));
//         });
//     }

//     async after() {
//         await remove(this.tempFolder);
//         if(this.app)
//             await this.app.close();
//     }

//     @test
//     async testRunSimulationReturns201() {
//         when(this.runnerServiceMock.runSimulation(anything())).thenResolve({
//             repository: {
//                 git: {
//                     url: "https://path/to/url",
//                     username: "johndoe01",
//                     password: "pass"
//                 },
//             },
//             runCommands: [
//                 "npm install",
//                 "npm start ${args}"
//             ]
//         });

//         const response: Response = await request(this.app.getHttpServer())
//             .post("/simulation")
//             .send({
//                 repository: {
//                     git: {
//                         url: "https://path/to/url",
//                         username: "johndoe01",
//                         password: "pass"
//                     },
//                 },
//                 scripts: [
//                     "npm install",
//                     "npm start ${args}"
//                 ]
//             })
//             .expect(printError(HttpStatus.CREATED))
//             .expect(HttpStatus.CREATED);

//         assert.exists(response.body.repository);
//         assert.exists(response.body.repository.git);
//         assert.equal(response.body.repository.git.url, "https://path/to/url");
//         assert.equal(response.body.repository.git.username, "johndoe01");
//         assert.equal(response.body.repository.git.password, "pass");
//         assert.deepEqual(response.body.scripts, ["npm install", "npm start ${args}"]);
//     }

//     @test
//     async testRunInvalidSimulationReturns400() {        
//         const response: Response = await request(this.app.getHttpServer())
//             .post("/simulation")
//             .send({})
//             .expect(printError(HttpStatus.BAD_REQUEST))
//             .expect(HttpStatus.BAD_REQUEST);

//         assert.equal(response.body.statusCode, HttpStatus.BAD_REQUEST);
//         assert.equal(response.body.errorCode, ErrorCode.CONSTRAINT_VIOLATION);
//         assert.include(response.body.message, "validation constraint");
//         assert.exists(response.body.errors);
//     }

//     @test
//     async testRunSimulationWhenLimitReachedReturns409() {
//         when(this.runnerServiceMock.runSimulation(anything())).thenThrow(new SimulationLimitReachedException("test 123"));
        
//         const response: Response = await request(this.app.getHttpServer())
//             .post("/simulation")
//             .send({
//                 repository: {
//                     git: {
//                         url: "https://path/to/url",
//                         username: "johndoe01",
//                         password: "pass"
//                     },
//                 },
//                 scripts: [
//                     "npm install",
//                     "npm start ${args}"
//                 ]
//             })
//             .expect(printError(HttpStatus.CONFLICT))
//             .expect(HttpStatus.CONFLICT);

//         assert.equal(response.body.statusCode, HttpStatus.CONFLICT);
//         assert.equal(response.body.message, "test 123");
//         assert.equal(response.body.errorCode, ErrorCode.SIMULATION_LIMIT_REACHED);
//     }

//     @test
//     async testGetSimulationReturns200() {
//         when(this.runnerServiceMock.getSimulation()).thenReturn({});
        
//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation")
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);
        
//         assert.deepEqual(response.body, {});
//     }

//     @test
//     async testGetLogReturns200() {
//         when(this.runnerServiceMock.getLog()).thenResolve(bufferToStream(Buffer.from("test 123")));
    
//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/log")
//             .parse(binaryParser)
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.equal(response.body.toString(), "test 123");
//     }

//     @test
//     async testGetEmptyLogReturns200() {
//         when(this.runnerServiceMock.getLog()).thenResolve(null);

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/log")
//             .parse(binaryParser)
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.equal(response.body.toString(), "");
//     }

//     @test
//     async testGetHarReturns200() {
//         when(this.runnerServiceMock.getHar()).thenResolve({ log: { entries: [] } });

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/har")
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.deepEqual(response.body, { log: { entries: [] } });
//     }

//     @test
//     async testGetHarWhenNotFoundReturns404() {
//         when(this.runnerServiceMock.getHar()).thenReject(new ResourceNotFoundException("test 123"));

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/har")
//             .expect(printError(HttpStatus.NOT_FOUND))
//             .expect(HttpStatus.NOT_FOUND);

//         assert.equal(response.body.statusCode, HttpStatus.NOT_FOUND);
//         assert.equal(response.body.errorCode, ErrorCode.RESOURCE_NOT_FOUND);
//         assert.equal(response.body.message, "test 123");
//     }

//     @test
//     async testGetActionsReturns200() {
//         when(this.runnerServiceMock.getActions()).thenResolve([{
//             name: "01_Transaction1",
//             date: new Date(0),
//             state: "start"
//         }]);

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/actions")
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.deepEqual(response.body, [{
//             name: "01_Transaction1",
//             date: "1970-01-01T00:00:00.000Z",
//             state: "start"
//         }]);
//     }

//     @test
//     async testGetAllScreenshotsReturns200() {
//         when(this.runnerServiceMock.getScreenshots()).thenResolve([{
//             name: "01_Transaction1.png",
//             taken: new Date(0)
//         }]);

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/screenshots")
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.deepEqual(response.body, [{
//             name: "01_Transaction1.png",
//             taken: "1970-01-01T00:00:00.000Z"
//         }]);
//     }

//     @test
//     async testGetScreenshotReturns200() {
//         when(this.runnerServiceMock.getScreenshot(anyString())).thenResolve(bufferToStream(Buffer.from("test 123")));

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/screenshots/01_Transaction1.png")
//             .parse(binaryParser)
//             .expect(printError(HttpStatus.OK))
//             .expect(HttpStatus.OK);

//         assert.deepEqual(response.body.toString(), "test 123");
//         verify(this.runnerServiceMock.getScreenshot("01_Transaction1.png")).once();
//     }

//     @test
//     async testGetScreenshotWhenNotFoundReturns404() {
//         when(this.runnerServiceMock.getScreenshot(anyString())).thenReject(new ResourceNotFoundException("test 123"));

//         const response: Response = await request(this.app.getHttpServer())
//             .get("/simulation/screenshots/not-found")
//             .expect(printError(HttpStatus.NOT_FOUND))
//             .expect(HttpStatus.NOT_FOUND);

//         assert.equal(response.body.statusCode, HttpStatus.NOT_FOUND);
//         assert.equal(response.body.errorCode, ErrorCode.RESOURCE_NOT_FOUND);
//         assert.equal(response.body.message, "test 123");
//     }

// }