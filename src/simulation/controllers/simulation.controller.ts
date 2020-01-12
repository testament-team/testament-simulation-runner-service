import { Body, Controller, Get, Header, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { streamToBuffer } from 'src/util/stream.util';
import { Readable } from 'stream';
import { RunSimulationDTO } from '../dtos/run-simulation.dto';
import { IHar } from '../interfaces/har.interface';
import { IScreenshot } from '../interfaces/screenshot.interface';
import { ISimulation } from '../interfaces/simulation.interface';
import { IAction } from '../interfaces/transaction.interface';
import { SimulationRunnerService } from '../services/simulation-runner.service';

@Controller('/simulation')
export class SimulationController {

    constructor(private simulationService: SimulationRunnerService) {
        
    }

    @Post()
    runSimulation(@Body() dto: RunSimulationDTO): Promise<ISimulation> {
        return this.simulationService.runSimulation(dto);
    }

    @Get()
    getSimulation(): ISimulation | {} {
        const simulation: ISimulation = this.simulationService.getSimulation();
        if(simulation) {
            return simulation;
        }
        return {};
    }

    @Get("/log")
    @Header("Content-Type", "text/plain")
    async getLog(@Res() res: Response) {
        const stream: Readable = await this.simulationService.getLog();
        if(stream == null) {
            res.end();
        } else {
            stream.pipe(res);
        }
    }

    @Get("/har")
    getHar(): Promise<IHar> {
        return this.simulationService.getHar();
    }

    @Get("/actions")
    getActions(): Promise<IAction[]> {
        return this.simulationService.getActions();
    }

    @Get("/screenshots")
    getScreenshots(): Promise<IScreenshot[]> {
        return this.simulationService.getScreenshots();
    }

    @Get("/screenshots/:name")
    async getScreenshot(@Param("name") name: string, @Res() res: Response) {
        const screenshot: Readable = await this.simulationService.getScreenshot(name);
        res.header("Content-Type", "image/png");
        const buffer: Buffer = await streamToBuffer(screenshot);
        res.send(buffer);
    }

}