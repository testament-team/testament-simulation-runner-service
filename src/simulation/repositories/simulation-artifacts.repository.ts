import { Inject, Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { createReadStream, unlink } from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { zip } from "zip-a-folder";

@Injectable()
export class SimulationArtifactsRepository {

    constructor(@Inject("S3") private s3: S3) {
        
    }

    async saveSimulationArtifacts(path: string): Promise<string> {
        const key: string = uuidv4() + ".zip";
        const zipPath: string = path + ".zip";
        await zip(path, zipPath);
        try {
            await this.s3.putObject({
                Bucket: `testament/tenants/public/simulation-artifacts`,
                Key: key,
                ContentType: "application/zip",
                Body: createReadStream(zipPath),
                ACL: "private",
            }).promise();
        } finally {
            await unlink(zipPath);
        }
        return key;
    }

}