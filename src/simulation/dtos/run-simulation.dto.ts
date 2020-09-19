import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Repository, SimulationType } from "../interfaces/simulation.interface";

export class StartSimulationEvent {
    @IsString()
    runId: string;

    @IsEnum(SimulationType)
    type: SimulationType;

    @ValidateNested()
    @IsNotEmpty()
    repository: Repository;

    @IsString()
    @IsOptional()
    args?: string;

    @IsString({ each: true })
    @IsNotEmpty()
    runCommands: string[];
}