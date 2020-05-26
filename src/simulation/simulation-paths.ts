import { tmpdir } from "os";
import { join } from "path";

export namespace SimulationPaths {
    export const SIMULATION_PATH    = join(tmpdir(), "testment_simulation");
    export const TMP_PATH           = join(SIMULATION_PATH, "tmp");
    export const LOG_PATH           = join(TMP_PATH, "log.txt");
    export const HAR_PATH           = join(TMP_PATH, "recording.har");
    export const ACTIONS_PATH       = join(TMP_PATH, "actions.json");
    export const SCREENSHOTS_PATH   = join(TMP_PATH, "screenshots");
}