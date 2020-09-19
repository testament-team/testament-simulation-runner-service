import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, Length, ValidateNested } from "class-validator";

export enum SimulationType {
    JAVA_CHROMIUM = "java_chromium"
}

export enum RepositoryType {
    GIT = "git"
}

export enum SimulationStatus {
    RUNNING = "running",
    FAILED = "failed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}

export class GitRepository {
    @IsString()
    @Length(1, 256)
    url: string;

    @IsString()
    @Length(1, 64)
    @IsOptional()
    username?: string;

    @IsString()
    @Length(1, 64)
    @IsOptional()
    password?: string;
}

export class Repository {
    @IsEnum(RepositoryType)
    type: RepositoryType;

    @IsOptional()
    @ValidateNested()
    @Type(() => GitRepository)
    git?: GitRepository;
}


export interface Simulation {
    runId: string;
    type: SimulationType;
    repository: Repository;
    args: string;
    runCommands: string[];
    status?: SimulationStatus;
    error?: string;
}