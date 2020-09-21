import { config } from "dotenv";
import { bootstrap } from "./bootstrap";

config();
bootstrap().catch(err => console.error(err));
