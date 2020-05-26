import { Injectable } from "@nestjs/common";
import simpleGit from "simple-git/promise";

export interface IGitRepositoryInfo {
    url: string;
    username?: string;
    password?: string;
}

@Injectable()
export class GitService {

    private git: simpleGit.SimpleGit = simpleGit();

    async cloneRepository(info: IGitRepositoryInfo, path?: string): Promise<void> {
        await this.git.clone(info.url, path, {
            username: info.username,
            password: info.password
        });
    }

}