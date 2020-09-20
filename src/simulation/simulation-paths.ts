import { tmpdir } from "os";
import { join } from "path";

export namespace SimulationPaths {
    export const SIMULATION_PATH    = join(tmpdir(), "testament_simulation");
    export const SRC_PATH           = src(SIMULATION_PATH);
    export const TMP_PATH           = tmp(SIMULATION_PATH);
    export const LOG_PATH           = log(SIMULATION_PATH);
    export const ANSI_LOG_PATH      = ansiLog(SIMULATION_PATH);
    export const HAR_PATH           = har(SIMULATION_PATH);
    export const ACTIONS_PATH       = actions(SIMULATION_PATH);
    export const SCREENSHOTS_PATH   = screenshots(SIMULATION_PATH);

    export function src(root: string) {
        return join(root, "src");
    }

    export function tmp(root: string) {
        return join(root, "tmp");
    }

    export function log(root: string) {
        return join(root, "tmp", "log.txt");
    }

    export function ansiLog(root: string) {
        return join(root, "tmp", "ansi-log.txt");
    }

    export function har(root: string) {
        return join(root, "tmp", "recording.har");
    }

    export function actions(root: string) {
        return join(root, "tmp", "actions.json");
    }

    export function screenshots(root: string) {
        return join(root, "tmp", "screenshots");
    }
}
