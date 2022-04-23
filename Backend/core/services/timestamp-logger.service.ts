import { injectable } from "inversify";
import { AbstractLogger } from "./abstract-logger.service";

@injectable()
export class TimeStampLogger extends AbstractLogger{
   public override info(...messages: string[]): void;
   public override info(...messages: string[]): void {
       console.info(this.getCurrentTimeStamp(), messages);
   }
   
   public override error(...messages: string[]): void;
   public override error(...messages: string[]): void {
    console.error(this.getCurrentTimeStamp(), messages);
   }

   private getCurrentTimeStamp() : String{
    const timeStamp = new Date();
     return timeStamp.toLocaleString();
   }
}