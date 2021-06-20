import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './auth/log-in/log-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { AuthGuard } from './guards/auth.guard';
import { CreateComponent } from './posts/create/create.component';
import { ListComponent } from './posts/list/list.component';

const routes: Routes = [
  { path: '', component: ListComponent },
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: CreateComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LogInComponent },
  { path: 'signup', component: SignUpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
