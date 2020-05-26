import { ErrorCode } from "src/error-codes";
import { ApiException } from "./api.exception";

export class ResourceNotFoundException extends ApiException {
    constructor(message: string) {
        super(message, 404, ErrorCode.RESOURCE_NOT_FOUND, {})
    }
}