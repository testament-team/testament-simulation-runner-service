import { Module } from '@nestjs/common';
import { s3Providers } from './s3.providers';

@Module({
    providers: s3Providers,
    exports: s3Providers
})
export class S3Module {}
