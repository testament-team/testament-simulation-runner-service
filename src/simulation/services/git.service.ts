import { Injectable } from "@nestjs/common";
import simpleGit from "simple-git/promise";

export interface GitRepositoryInfo {
    url: string;
    username?: string;
    password?: string;
}

@Injectable()
export class GitService {

    private git: simpleGit.SimpleGit = simpleGit();

    async cloneRepository(info: GitRepositoryInfo, path?: string): Promise<void> {
        await this.git.clone(info.url, path, {
            username: info.username,
            password: info.password
        });
    }

}