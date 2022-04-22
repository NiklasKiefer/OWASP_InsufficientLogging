import { inject, injectable } from "inversify";
import { controller, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import { DatabaseService } from "../../core/services/database.service";
import {Request, Response } from "express";
import { TimeStampLogger } from "../../core/services/timestamp-logger.service";


@controller('/v1/register')
@injectable()
export class RegisterController implements interfaces.Controller{
    constructor(@inject(DatabaseService.name) private databaseService: DatabaseService, @inject(TimeStampLogger.name) private timeStampLogger: TimeStampLogger) {

    }

    @httpPost('/user/:username&:password')
    public register(request: Request, response: Response): void{
        this.timeStampLogger.info(`User \"${request.params.username}\" tries to register`);
        this.databaseService.registerUser(request.params.username, request.params.password).then((result) =>{
            response.status(200).json(result);
        })
    }
}