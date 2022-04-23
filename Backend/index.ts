import { IoContainer } from './core/ioc/ioc.container';
import * as express from 'express';
import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { DatabaseService } from './core/services/database.service';
import { appendFile } from 'fs';
import * as cors from 'cors';
import { TimeStampLogger } from './core/services/timestamp-logger.service';

const container = new IoContainer();
container.init();

const timeStampLogger = container.getContainer().resolve(TimeStampLogger);
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
    timeStampLogger.info("Server listening on port 9999.");
}).catch((error ) =>{
    console.log(error);
    timeStampLogger.error( "Error while starting express server.");
})
