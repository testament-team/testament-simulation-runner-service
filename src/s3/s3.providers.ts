import { Provider } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { env } from "process";

export const s3Providers: Provider[] = [
    {
        provide: "S3",
        useFactory: async () => {
            const s3: S3 = new S3({
                endpoint: env.S3_ENDPOINT,
                accessKeyId: env.S3_ACCESS_KEY,
                secretAccessKey: env.S3_SECRET_KEY
            });
            return s3;
        }
    }
];