import { Component, OnInit, Inject } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HttpClient } from '@angular/common/http';
import { Router} from '@angular/router';
import apiConfiguration from '../../../assets/config/api-config.json';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private loggerService: LoggerService, private httpClient: HttpClient, private router: Router, private snackBar: MatSnackBar) { }

  public hide = true;

  ngOnInit(): void {
  }

  private getClassAndMethodStack(methodname: string){
    return "[LoginComponent]" + "[" + methodname + "]";
}

  public loginUser(username: string, password: string): void {
    if (username == '' || password == '') {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: {msg: 'Username or password is false.'},
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }

    let url = apiConfiguration.login + username + '&'  + password;

    this.httpClient
    .get<any>(url, {})
    .subscribe({
      next: response => {
        if (response.Login) {
          this.loggerService.info(this.getClassAndMethodStack("loginUser"),'User logged in.');
          this.router.navigateByUrl('home', { state: {username: username, password: password} });
        }
        else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: {msg: 'Username or password is false.'},
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
    },
    complete: () => this.loggerService.info(this.getClassAndMethodStack("loginUser"),'Login complete.'),
    });
  }

  public controlUsername = new FormControl('', [Validators.required]);
  public controlPassword = new FormControl('', [Validators.required]);

  public getErrorMessage(element: FormControl) {
    if (element.hasError('required')) {
      return 'You must enter a value';
    }

    return element.hasError('email') ? 'Not a valid email.' : '';
  }

  public register(): void {
    this.router.navigateByUrl('register');
  }
}
