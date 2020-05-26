import { ValidationError } from "class-validator";
import { ErrorCode } from "src/error-codes";
import { ApiException } from "./api.exception";

export class ConstraintViolationException extends ApiException {
    constructor(message: string, errors: ValidationError[]) {
        super(message, 400, ErrorCode.CONSTRAINT_VIOLATION, { errors })
    }
}