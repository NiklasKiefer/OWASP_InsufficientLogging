import 'reflect-metadata';
import { injectable } from 'inversify';
import { ILogger } from '../Interfaces/ILogger';

@injectable()
export class LoggerService implements ILogger {
    public info(stack:string,messages: string): void {
        console.info(this.combineLogMessage(stack,messages))
    }

    public warn(stack:string,messages:string): void{
        console.warn(this.combineLogMessage(stack,messages))
    }

    public error(stack:string,messages: string): void {
        console.error(this.combineLogMessage(stack,messages));
    }

    private combineLogMessage(stack:string,messages:string): string{
        let timestamp = this.getTimeStamp();
        return stack + " : " +timestamp + " " + messages;
    }

    private getTimeStamp(): string{
        return new Date().toLocaleDateString();
    }
}