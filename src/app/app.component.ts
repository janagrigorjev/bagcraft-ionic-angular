import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {
  addCircleOutline,
  bagHandleOutline,
  constructOutline,
  logOutOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
  public authService: AuthService,
  private router: Router,
  private menuController: MenuController
  ) {
  addIcons({
    addCircleOutline,
    bagHandleOutline,
    constructOutline,
    logOutOutline,
    personOutline
  });
  }

  async logout(): Promise<void> {
  await this.menuController.close();
  this.authService.logout();
  await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
