import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
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

  onSignUp(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.auth.createUser(form.value.email, form.value.password);
  }
}
