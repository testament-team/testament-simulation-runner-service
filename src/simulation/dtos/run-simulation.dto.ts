import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class SimulationGitRepositoryConfig {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    username: string;

    @IsString()
    password: string;
}

export class SimulationRepository {
    @ValidateNested()
    @IsOptional()
    git?: SimulationGitRepositoryConfig;
}

export class RunSimulationDTO {
    @ValidateNested()
    @IsNotEmpty()
    repository: SimulationRepository;

    @IsString()
    @IsOptional()
    args?: string;

    @IsString({ each: true })
    @IsNotEmpty()
    scripts: string[];
}