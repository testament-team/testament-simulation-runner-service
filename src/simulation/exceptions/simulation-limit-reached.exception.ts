import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "src/error-codes";
import { ApiException } from "src/exceptions/api.exception";

export class SimulationLimitReachedException extends ApiException {
    constructor(message: string) {
        super(message, HttpStatus.CONFLICT, ErrorCode.SIMULATION_LIMIT_REACHED, {});
    }
}