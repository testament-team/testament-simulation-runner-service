import { ValidationPipe } from "@nestjs/common";
import { ConstraintViolationException } from "./exceptions/constraint-violation.exception";

export const validationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: (errors => new ConstraintViolationException(`Request violated ${errors.length} validation constraint(s)`, errors))
});