import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import apiConfiguration from '../../../assets/config/api-config.json';
import { HttpClient } from '@angular/common/http';
import { Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private loggerService: LoggerService, private httpClient: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }

  public logoutUser(): void {
    let url = apiConfiguration.logout + history.state.username + '&' + history.state.password;
    
    this.httpClient
    .post<any>(url, {})
    .subscribe({
      next: response => {
        if (response.created) {
          this.loggerService.info('User logged out.');
        }
    },
    complete: () => {
      this.loggerService.info('Logging out complete.');
      this.router.navigateByUrl('');
    },
    });
  }
}
