export interface ILogger{
  info(stack: string,messages: string): void;
  warn(stack: string,messages: string): void;
  error(stack: string,messages: string): void;
}
