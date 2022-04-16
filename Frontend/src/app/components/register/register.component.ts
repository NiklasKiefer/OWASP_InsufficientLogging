import { Component, OnInit, Inject } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HttpClient } from '@angular/common/http';
import { Router} from '@angular/router';
import apiConfiguration  from '../../../assets/config/api-config.json';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private loggerService: LoggerService, private httpClient: HttpClient, private router: Router, private snackBar: MatSnackBar) { }
  public hide = true;

  ngOnInit(): void {
  }

  public registerUser(username: string, password: string): void {

    if (username == '' || password == '') {
      this.snackBar.openFromComponent(SnackbarComponent, { 
        data: {msg: 'Please fill the fields with a * out.'}, 
        duration: 4000, 
        horizontalPosition: 'center',
        verticalPosition: 'top' 
      });
    }

    let url = apiConfiguration.register + username + '&' + password;
    
    this.httpClient
    .post<any>(url, {})
    .subscribe({
      next: response => {
        if (response.created) {
          this.loggerService.info('User registered.');
          this.router.navigateByUrl('home', { state: {username: username, password: password} });
        }
        else {
          this.snackBar.openFromComponent(SnackbarComponent, { 
            data: {msg: 'Username already taken.'}, 
            duration: 4000, 
            horizontalPosition: 'center',
            verticalPosition: 'top' 
          });

          this.loggerService.info('Username already taken.');
        }
    },
    complete: () => this.loggerService.info('Registering complete.'),
    });
  }

  public controlUsername = new FormControl('', [Validators.required]);
  public controlEmail = new FormControl('', [Validators.required, Validators.email]);
  public controlPassword = new FormControl('', [Validators.required]);

  public getErrorMessage(element: FormControl) {
    return element.hasError('required') ? 'You must enter a value.' : '';
  }
}
