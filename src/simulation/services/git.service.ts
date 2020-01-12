import { Injectable } from "@nestjs/common";
import * as simpleGit from "simple-git/promise";

export interface IGitRepositoryInfo {
    url: string;
    username?: string;
    password?: string;
}

@Injectable()
export class GitService {

    private git: simpleGit.SimpleGit = simpleGit();

    cloneRepository(info: IGitRepositoryInfo, path?: string): Promise<string> {
        return this.git.clone(info.url, path, {
            username: info.username,
            password: info.password
        });
    }

}