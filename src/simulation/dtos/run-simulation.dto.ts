export class SimulationGitRepositoryConfig {
    url: string;
    username: string;
    password: string;
}

export class SimulationRepository {
    git?: SimulationGitRepositoryConfig;
}

export class RunSimulationDTO {
    repository: SimulationRepository;
    args?: string;
    scripts: string[];
}