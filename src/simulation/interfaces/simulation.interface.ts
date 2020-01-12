export interface ISimulationGitRepositoryConfig {
    url: string;
    username: string;
    password: string;
}

export interface ISimulationRepository {
    git?: ISimulationGitRepositoryConfig;
}

export type status = "running" | "failed" | "cancelled" | "passed";

export interface ISimulationStatus {
    value?: status;
    errorMessage?: string;
}

export interface ISimulation {
    repository: ISimulationRepository;
    args?: string;
    status?: ISimulationStatus;
    scripts: string[];
}