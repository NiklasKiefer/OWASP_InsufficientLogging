import 'reflect-metadata';
import { injectable } from 'inversify';

@injectable()
export class LoggerService {
    public info(...messages: string[]): void {
        console.info(messages)
    }

    public error(...messages: string[]): void {
        console.error(messages);
    }
}