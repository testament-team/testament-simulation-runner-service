import { assert } from "chai";
import { mkdirp, readFile, remove, writeFile } from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import { SimulationPaths } from "../simulation-paths";
import { FileLogger } from "./logger";

@suite()
export class FileLoggerTests {

    private fileLogger: FileLogger;
    private tempFolder: string = SimulationPaths.LOG_PATH;

    async before() {
        await remove(this.tempFolder);
        await mkdirp(this.tempFolder);
        this.fileLogger = new FileLogger();
    }

    async after() {
        await remove(this.tempFolder);
    }

    @test
    async testInfo() {
        const logPath: string = join(this.tempFolder, "info-log.txt");
        this.fileLogger.setPath(logPath);
        await this.fileLogger.info("INFO: Testing 1,2,3");
        const logFile: string = (await readFile(logPath)).toString();
        assert.equal(logFile, "INFO: Testing 1,2,3");
    }

    @test
    async testError() {
        const logPath: string = join(this.tempFolder, "error-log.txt")
        this.fileLogger.setPath(logPath);
        await this.fileLogger.error("ERROR: Testing 1,2,3");
        const logFile: string = (await readFile(logPath)).toString();
        assert.equal(logFile, "ERROR: Testing 1,2,3");
    }

    @test
    async testClear() {
        const logPath: string = join(this.tempFolder, "clear-log.txt");
        await writeFile(logPath, "CLEAR: Testing 1, 2, 3");
        this.fileLogger.setPath(logPath);
        await this.fileLogger.clear();
        const logFile: string = (await readFile(logPath)).toString();
        assert.equal(logFile, "");
    }

}