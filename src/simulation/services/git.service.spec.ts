import { mkdirp, remove } from "fs-extra";
import { suite, test } from "mocha-typescript";
import { tmpdir } from "os";
import { join } from "path";
import { GitService } from "./git.service";

@suite
export class GitServiceTests {

    private gitService: GitService;
    private tempFolder: string = join(tmpdir(), "testment_tests");

    async before() {
        await remove(this.tempFolder);
        await mkdirp(this.tempFolder);
        this.gitService = new GitService();
    }

    async after() {
        await remove(this.tempFolder);
    }

    @test
    async testCloneRepositoryWithPath() {
        await this.gitService.cloneRepository({
            url: "https://github.com/testment-team/testment-runner.git"
        }, join(this.tempFolder, "git-project"));
    }

}