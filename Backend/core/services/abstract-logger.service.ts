import 'reflect-metadata';
import { injectable } from 'inversify';
import { Logger } from './logger.interface';


@injectable()
export class AbstractLogger implements Logger {
    info(...messages: string[]): void;
    info(...messages: string[]): void{
        console.info(messages);
    }
    error(...messages: string[]): void;
    error(...messages: string[]): void{
        console.error(messages);
    }
}