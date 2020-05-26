import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { EventEmitter } from "events";

export interface ICommand {
    cmd: EventEmitter;
    stdout: EventEmitter;
    stderr: EventEmitter;
}

export class Cli {
    spawn(command: string, options?: SpawnOptionsWithoutStdio): ICommand {
        const cmd = spawn(command, options);
        return {
            cmd: cmd,
            stdout: cmd.stdout,
            stderr: cmd.stderr
        };
    }
}