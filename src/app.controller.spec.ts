import { HttpStatus, INestApplication } from '@nestjs/common';
import { assert } from 'chai';
import { suite, test } from "mocha-typescript";
import { setupControllerTest } from 'src/util/test/nestjs-testing.util';
import { printError } from "src/util/test/supertest.util";
import request, { Response } from "supertest";
import { AppModule } from './app.module';

@suite
export class AppControllerTests {

    private app: INestApplication;

    async before() {
        this.app = await setupControllerTest(AppModule);
    }

    async after() {
        if(this.app)
            await this.app.close();
    }

    @test
    async testGetEmptyRouteReturns200() {
        const response: Response = await request(this.app.getHttpServer())
            .get("/")
            .expect(printError(HttpStatus.OK))
            .expect(HttpStatus.OK);

        assert.deepEqual(response.body, {});
    }

}