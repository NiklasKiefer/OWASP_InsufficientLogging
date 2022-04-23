import { inject, injectable } from "inversify";
import { controller, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import { DatabaseService } from "../../core/services/database.service";
import {Request, Response } from "express";
import { TimeStampLogger } from "../../core/services/timestamp-logger.service";


@controller('/v1/login')
@injectable()
export class LoginController implements interfaces.Controller{
    constructor(@inject(DatabaseService.name) private databaseService: DatabaseService, @inject(TimeStampLogger.name) private timeStampLogger: TimeStampLogger) {

    }

    @httpGet('/user/:username&:password')
    public login(request: Request, response: Response): void{
        this.databaseService.loginUser(request.params.username, request.params.password).then((result) =>{
            response.status(200).json(result);
        })
    }

    @httpPost('/userlogout/:username&:password')
    public logout(request: Request, response: Response): void{
        this.timeStampLogger.info(`User \"${request.params.username}\" with password  \"${request.params.password}\" tries to log out.`);
        response.status(200).json("Log out completed");
        this.timeStampLogger.info(`User \"${request.params.username}\" with password  \"${request.params.password}\" was logged out.`);
    }
}