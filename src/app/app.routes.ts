import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { SignupComponent } from './features/signup/signup.component';
import { UserInforComponent } from './features/user/user-infor/user-infor.component';

export const routes: Routes = [
      {
            path: '',
            component: HomeComponent
      },
      {
            path: 'login',
            component: LoginComponent
      },
      {
            path: 'signup',
            component: SignupComponent
      },
      {
            path: 'user/infor',
            component: UserInforComponent
      },
      
];
