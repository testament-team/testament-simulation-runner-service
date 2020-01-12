import { Injectable } from "@nestjs/common";
import * as fs from "fs-extra";
import uuid = require("uuid");

export interface ILogger {
    info(message: string): void | Promise<void>;
    error(message: string): void | Promise<void>;
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
        console.log(message);
        await fs.appendFile(this.path, message);    
    }

    async error(message: string) {
        this.info(message);  
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