import { HttpException } from "@nestjs/common";

export class ApiException extends HttpException {
    constructor(public message: string, statusCode: number, public errorCode: string, public extraFields: any) {
        super(Object.assign({
            statusCode,
            errorCode,
            message,
        }, extraFields), statusCode);
    }
}