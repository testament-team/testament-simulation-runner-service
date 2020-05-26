import { INestApplication } from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { validationPipe } from "src/app.validation.pipe";

export async function setupControllerTest(module: any, fn?: (builder: TestingModuleBuilder) => void): Promise<INestApplication> {
    const moduleBuilder = Test.createTestingModule({
        imports: [module],
    });
    if(fn) {
        fn(moduleBuilder);
    }
    const app: INestApplication = (await moduleBuilder.compile()).createNestApplication();
    // TODO: right thing to do here?
    app.useGlobalPipes(validationPipe);
    await app.init();
    return app;
}