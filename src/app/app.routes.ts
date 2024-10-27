import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { SignupComponent } from './features/signup/signup.component';
import { UserInforComponent } from './features/user/user-infor/user-infor.component';

export const ROUTES = {
      home: '',
      login: 'login',
      signup: 'signup',
      userInfo: 'user/infor',
    };

export const routes: Routes = [
      {
            path: ROUTES.home,
            component: HomeComponent
      },
      {
            path: ROUTES.login,
            component: LoginComponent
      },
      {
            path: ROUTES.signup,
            component: SignupComponent
      },
      {
            path: ROUTES.userInfo,
            component: UserInforComponent
      },
      
];
