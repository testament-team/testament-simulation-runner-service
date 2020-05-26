import { INestApplication } from "@nestjs/common";
import { suite, test } from "mocha-typescript";
import { bootstrap } from "./bootstrap";

@suite
export class BootstrapTests {

    private app: INestApplication;

    async after() {
        if(this.app)
            await this.app.close();
    }

    @test
    async testDoesNotBlowUp() {
        this.app = await bootstrap();
    }

}