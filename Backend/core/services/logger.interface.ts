import 'reflect-metadata';

export interface Logger{
    info(...messages: string[]): void;
    error(...messages: string[]): void;
}