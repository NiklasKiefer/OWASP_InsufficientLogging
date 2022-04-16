import {Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})

  export class LoggerService {
    public info(...messages: string[]): void {
      console.info(messages);
    }
}