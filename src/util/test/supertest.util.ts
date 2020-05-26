import { Response } from "supertest";

export function binaryParser(res: Response, callback) {
    let data: string = "";
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => callback(null, Buffer.from(data, "binary")));
}

export function printError(expectedStatus: number) {
    return (res: Response) => {
        if(res.status !== expectedStatus) {
            console.log("\n--------------------\nERROR RESPONSE BODY\n--------------------\n\n", res.body);
        }
    };
}