import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  authStatusListener: Subscription = new Subscription();
  authenticated: boolean = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.authenticated = this.auth.getIsAuth();
    this.authStatusListener = this.auth
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.authenticated = isAuthenticated;
      });
  }

  onLogOut(): void {
    this.auth.logOut();
  }

  ngOnDestroy(): void {
    this.authStatusListener.unsubscribe();
  }
}
