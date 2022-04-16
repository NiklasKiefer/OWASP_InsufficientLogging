import { IoContainer } from './core/ioc/ioc.container';
import { LoggerService } from './core/services/logger.service';
import * as express from 'express';
import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { DatabaseService } from './core/services/database.service';
import { appendFile } from 'fs';
import * as cors from 'cors';

const container = new IoContainer();
container.init();

const logger = container.getContainer().resolve(LoggerService);
const databaseService = container.getContainer().resolve(DatabaseService);

const server = new InversifyExpressServer(container.getContainer());

server.setConfig((app) => {
    var cors = require('cors');
    app.use(cors({origin: `*`}));
    app.options('https://localhost:4200', cors());
});


databaseService.initialize().then(() =>{
    const app = server.build();

    app.listen(9999);
    logger.info("Server listening on port 9999");
}).catch((error ) =>{
    console.log(error);
    logger.error( "Error while starting express server");
})
