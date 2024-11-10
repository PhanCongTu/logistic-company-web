import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { SignupComponent } from './features/signup/signup.component';
import { UserInforComponent } from './features/user/user-infor/user-infor.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { WarehouseComponent } from './features/admin/warehouse/warehouse.component';
import { UserComponent } from './features/admin/user/user.component';

export const ROUTES = {
      home: '',
      login: 'login',
      signup: 'signup',
      resetPassword: 'reset-password',
      userInfo: 'user/infor',
      adminWarehouse: 'admin/warehouse',
      adminUser: 'admin/user',
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
      {
            path: ROUTES.resetPassword,
            component: ResetPasswordComponent
      },
      {
            path: ROUTES.adminWarehouse,
            component: WarehouseComponent
      },
      {
            path: ROUTES.adminUser,
            component: UserComponent
      },
];
