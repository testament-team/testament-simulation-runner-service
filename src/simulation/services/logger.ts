import { Injectable } from "@nestjs/common";
import * as fs from "fs-extra";
import { stderr, stdout } from "process";
import uuid = require("uuid");

export interface ILogger {
    info(message: string): void | Promise<void>;
    error(message: string): void | Promise<void>;
}

export class ConsoleLogger implements ILogger {
    info(message: string): void | Promise<void> {
        stdout.write(message);
    }
    error(message: string): void | Promise<void> {
        stderr.write(message);
    }
}

@Injectable()
export class FileLogger implements ILogger {
    private path: string;
    // constructor(private path?: string) {
    //     if(!path) {
    //         this.path = join(tmpdir(), uuid() + ".txt");
    //     }
    // }

    setPath(path: string) {
        this.path = path;
    }

    async clear() {
        await fs.ensureFile(this.path);
        await fs.writeFile(this.path, "");
    }

    async info(message: string) {
        stdout.write(message); // TODO: remove?
        await fs.appendFile(this.path, message);    
    }

    async error(message: string) {
        await this.info(message);  
    }
}

export interface LoggerFactory {
    getLogger(): ILogger;
}

// export class DefaultLoggerFactory implements LoggerFactory {
//     getLogger(): ILogger {
//         return new FileLogger(join(tmpdir(), uuid() + ".txt"));
//     }
// }