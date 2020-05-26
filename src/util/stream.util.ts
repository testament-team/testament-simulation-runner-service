import { PassThrough, Readable } from "stream";

export function bufferToStream(buffer: Buffer): Readable {
    const bufferStream: PassThrough = new PassThrough();
    bufferStream.end(buffer);
    return bufferStream;
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        stream.on('data', (buffer) => buffers.push(buffer));
        stream.on('error', (error) => reject(error));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
}