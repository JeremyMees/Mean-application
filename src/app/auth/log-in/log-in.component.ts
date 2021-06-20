import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  authListener = new Subscription();

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.authListener = this.auth
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.authListener.unsubscribe();
  }

  onLogin(form: NgForm): void {
    this.isLoading = true;
    if (form.invalid) {
      return;
    }
    this.auth.logIn(form.value.email, form.value.password);
  }
}
